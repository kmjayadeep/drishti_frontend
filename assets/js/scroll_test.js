var controller = new ScrollMagic.Controller();

var scene = new ScrollMagic.Scene({
	triggerElement: '#sponsor',
  offset: 100, // start scene after scrolling for 100px
  duration: 400 // pin the element for 400px of scrolling
})
controller.addScene(scene);