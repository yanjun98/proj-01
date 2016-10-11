

var _ua = navigator.userAgent.toLowerCase();
var TOUCHEVENT = {
  touchstart: "touchstart",
  touchmove: "touchmove",
  touchend: "touchend",
  isdesktop:_ua.indexOf('android')>-1 ||_ua.indexOf('linux')>-1 ||_ua.indexOf('mobile')>-1 ||_ua.indexOf('iphone')>-1 ||_ua.indexOf('ipad')>-1 ? false : true,
  initTouchEvents: function () {
      if (TOUCHEVENT.isdesktop) {
					this.touchstart = "mousedown";
					this.touchmove = "mousemove";
					this.touchend = "mouseup";
      }
  },

};

var DRAGTHROW={};
DRAGTHROW.defaults = {
    angle: 0,     //角度
    speed: 0,       //速度
    inertia: 0.98,       //摩擦
    minimalSpeed: 0.001,  //最少速度
    minimalAngleChange: 0.1,  //最少角度
    step: 0,      //
    stepTransitionTime: 0,
    stepTransitionEasing: 'linear',
    rotateParentInstantly: false,
    touchElement: null
};
// init;
DRAGTHROW.init=function(){

	DRAGTHROW.virtualAngle=DRAGTHROW.lastAppliedAngle=DRAGTHROW._angle=DRAGTHROW.defaults.angle;
	DRAGTHROW.minimalAngleChange=DRAGTHROW.defaults.minimalAngleChange;
	DRAGTHROW.speed=DRAGTHROW.defaults.speed;
	DRAGTHROW.inertia=DRAGTHROW.defaults.inertia;
	DRAGTHROW.minimalSpeed=DRAGTHROW.defaults.minimalSpeed;

	DRAGTHROW.initCSSPrefix();

	TOUCHEVENT.initTouchEvents();
	DRAGTHROW.eventHandlers();
	DRAGTHROW.render();
};

// 
DRAGTHROW.eventHandlers=function(){
	
	circleWrapper.addEventListener(TOUCHEVENT.touchstart , DRAGTHROW.touchStartHandler);
	circleWrapper.addEventListener(TOUCHEVENT.touchmove , DRAGTHROW.touchMoveHandler);
	circleWrapper.addEventListener(TOUCHEVENT.touchend , DRAGTHROW.touchEndHandler);
};

// touch start;
DRAGTHROW.touchStartHandler=function(e){
	e.preventDefault();
	e.stopPropagation();
	DRAGTHROW.active=true;
	DRAGTHROW.initDrag();
	DRAGTHROW.initCoordinates();
	DRAGTHROW.onDragStart()
};

// touch move;
DRAGTHROW.touchMoveHandler=function(e){
	if(DRAGTHROW.active==true){
		 e.stopPropagation();
   	 e.preventDefault();

   	 if (e.targetTouches !== undefined && e.targetTouches[0] !== undefined) {
          DRAGTHROW.lastMouseEvent = {
              pageX: e.targetTouches[0].pageX,
              pageY: e.targetTouches[0].pageY
          }
      } else {
          DRAGTHROW.lastMouseEvent = {
              pageX: e.pageX || e.clientX,
              pageY: e.pageY || e.clientY
          }
      }

      // console.log(DRAGTHROW.lastMouseEvent);
   	 
	}
};

// touch end;
DRAGTHROW.touchEndHandler=function(e){
	console.log('touchend');
	DRAGTHROW.active=false;
	DRAGTHROW.onDragStop();
};

// drag start callback;
DRAGTHROW.onDragStart=function(){
	return false;
}

// drag stop callback;
DRAGTHROW.onDragStop=function(){

}

DRAGTHROW.onStop=function(){
	DRAGTHROW.speed=0;
}

// 开始drag;
DRAGTHROW.initDrag=function(){
	DRAGTHROW.speed = 0;
	DRAGTHROW.lastMouseAngle = undefined;
	DRAGTHROW.lastElementAngle = undefined;
	DRAGTHROW.lastMouseEvent = undefined;
	DRAGTHROW.active=true;

	// DRAGTHROW.virtualAngle=DRAGTHROW.lastAppliedAngle=DRAGTHROW._angle=DRAGTHROW.defaults.angle;
	// console.log('initdrag: ' + DRAGTHROW._angle);
}

//get Coordinates;
DRAGTHROW.initCoordinates=function(){
	var offsetLeft=circleWrapper.offsetLeft;
	var offsetTop=circleWrapper.offsetTop;
	DRAGTHROW.centerX=offsetLeft+circleWrapper.offsetWidth*0.5;
	DRAGTHROW.centerY=offsetTop+circleWrapper.offsetHeight*0.5;

	// console.log('DRAGTHROW.center: '+DRAGTHROW.centerX+' x '+DRAGTHROW.centerY);

}

// render;
DRAGTHROW.render=function(){
	// console.log('render');
	if (DRAGTHROW.lastMouseEvent !== undefined && DRAGTHROW.active === true) {
      DRAGTHROW.updateAngleToMouse(DRAGTHROW.lastMouseEvent);
  }

  DRAGTHROW.updateAngle();
  DRAGTHROW.applySpeed();
  DRAGTHROW.applyInertia();

  // var diffMoveAngle=Math.abs(DRAGTHROW.lastAppliedAngle - DRAGTHROW._angle);
  // console.log('diffMoveAngle: '+diffMoveAngle);
  // console.log('DRAGTHROW._angle :'+DRAGTHROW._angle );
  if (Math.abs(DRAGTHROW.lastAppliedAngle - DRAGTHROW._angle) >= DRAGTHROW.minimalAngleChange ) {
      DRAGTHROW.updateCSS();

      // if (this.onRotate !== undefined && typeof this.onRotate === 'function') {
      //     this.onRotate.bind(this)();
      // }

      DRAGTHROW.lastAppliedAngle = DRAGTHROW._angle;

      // console.log('_angle: '+DRAGTHROW._angle);
  }

	requestAnimationFrame(DRAGTHROW.render);
};


// rotate with mouse or touch;
DRAGTHROW.updateAngleToMouse=function(_laseMouseEvent){
	var xDiff = _laseMouseEvent.pageX - DRAGTHROW.centerX;
  var yDiff = _laseMouseEvent.pageY - DRAGTHROW.centerY;

  var mouseRadians = Math.atan2(xDiff, yDiff);
  var mouseDegrees = mouseRadians * (180 / Math.PI * -1) + 180;

  if (DRAGTHROW.lastMouseAngle === undefined) {
      DRAGTHROW.lastElementAngle = DRAGTHROW.virtualAngle;
      DRAGTHROW.lastMouseAngle = mouseDegrees;
  }

  var oldAngle = DRAGTHROW.virtualAngle;
  DRAGTHROW.mouseDiff = mouseDegrees - DRAGTHROW.lastMouseAngle;
  // console.log('mouseDegrees: '+mouseDegrees);
  DRAGTHROW.virtualAngle = DRAGTHROW.lastElementAngle + DRAGTHROW.mouseDiff;

  var newAngle = DRAGTHROW.virtualAngle;
  // console.log('===>update angle to mouse newAngle: '+newAngle);
	DRAGTHROW.speed = DRAGTHROW.differenceBetweenAngles(newAngle, oldAngle);
}


// get speed;
DRAGTHROW.differenceBetweenAngles = function (newAngle, oldAngle) {
    var a1 = newAngle * (Math.PI / 180);
    var a2 = oldAngle * (Math.PI / 180);
    var radians = Math.atan2(Math.sin(a1 - a2), Math.cos(a1 - a2));
    var degrees = radians * (180 / Math.PI);
    console.log('speed: '+degrees);
    return Math.round(degrees * 100) / 100;
}

//apply speed;
DRAGTHROW.applySpeed=function(){
	if (DRAGTHROW.inertia > 0 && DRAGTHROW.speed !== 0 && DRAGTHROW.active === false) {
      DRAGTHROW.virtualAngle += DRAGTHROW.speed;
  }

}

// apply friction
DRAGTHROW.applyInertia = function () {
    if (DRAGTHROW.inertia > 0) {
        if (Math.abs(DRAGTHROW.speed) >= DRAGTHROW.minimalSpeed) {
            DRAGTHROW.speed = DRAGTHROW.speed * DRAGTHROW.inertia;

            //Execute onStop callback if stopped
            if (DRAGTHROW.active === false && Math.abs(DRAGTHROW.speed) < DRAGTHROW.minimalSpeed) {
                if (DRAGTHROW.onStop !== undefined) {
                    DRAGTHROW.onStop();
                }
            }
        } else if (DRAGTHROW.speed !== 0) {
            DRAGTHROW.speed = 0;
        }
    }
}

// update angle;
DRAGTHROW.updateAngle=function(){
	DRAGTHROW._angle = DRAGTHROW.normalizeAngle(DRAGTHROW.virtualAngle);
}

DRAGTHROW.normalizeAngle=function(_angle){
	 var result = _angle;
        result = result % 360;
        if (result < 0) {
            result = 360 + result;
        }
    return result;
}

// update updateCSS;
DRAGTHROW.updateCSS=function(){
	// console.log('updatecss');
	// circleWrapper.style.transform = 'rotate(' + DRAGTHROW._angle + 'deg) ';
	circleWrapper.style[DRAGTHROW.cssPrefix + 'transform'] = 'rotate(' + this._angle + 'deg) ';
}

DRAGTHROW.initCSSPrefix = function () {
    if (DRAGTHROW.cssPrefix === undefined) {
        if (typeof(document.body.style.transform) != 'undefined') {
            DRAGTHROW.cssPrefix = '';
        } else if (typeof(document.body.style.mozTransform) != 'undefined') {
            DRAGTHROW.cssPrefix = '-moz-';
        } else if (typeof(document.body.style.webkitTransform) != 'undefined') {
            DRAGTHROW.cssPrefix = '-webkit-';
        } else if (typeof(document.body.style.msTransform) != 'undefined') {
            DRAGTHROW.cssPrefix = '-ms-';
        }
    }
}






// -------------------------------;

var circleWrapper=document.querySelector('.circle-wrapper');
console.log('circleWrapper: '+circleWrapper);

DRAGTHROW.init();
