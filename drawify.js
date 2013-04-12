Points = new Meteor.Collection('Points');

if (Meteor.isClient) {
  var canvas;
  // Template.hello.greeting = function () {
  //   return "Welcome to drawify.";
  // };

  // Template.hello.events({
  //   'click input' : function () {
  //     // template data, if any, is available in 'this'
  //     if (typeof console !== 'undefined')
  //       console.log("You pressed the button");
  //   }
  // });
  
  Deps.autorun( function () {
    Meteor.subscribe('allPoints');
  });

  Meteor.startup( function() {
    canvas = new Canvas();

    Deps.autorun( function() {
      var data = Points.find({}).fetch();
      $('h2').hide();
      if (canvas) {
        canvas.draw(data);
      }
    });
  });

  Template.drawingSurface.title = function () {
    return 'Drawify';
  }

  Template.drawingSurface.events({
    'click input': function (event) {
      Meteor.call('clear', function() {
        canvas.clear();
      });
    }
  })

  var markPoint = function() {
    var offset = $('#canvas').offset();
        Points.insert({
        x: (event.pageX - offset.left),
        y: (event.pageY - offset.top)});
  }

  Template.canvas.events({
    'click': function (event) {
      markPoint();
    },
    'mousedown': function (event) {
      Session.set('draw', true);
    },
    'mouseup': function (event) {
      Session.set('draw', false);
    },
    'mousemove': function (event) {
      if (Session.get('draw')) {
        markPoint();
      }
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    Meteor.publish('allPoints', function () {
      return Points.find();
    });

    Meteor.methods({
      'clear': function () {
        Points.remove({});
      }
    });
  });
}



//D3.js | Canvas
Canvas = function () {
  var self = this;
  var svg;

  var createSvg = function() {
    svg = d3.select('#canvas').append('svg')
      .attr('width', '100%')
      .attr('height', '100%');
  };
  createSvg();

  self.clear = function() {
    d3.select('svg').remove();
    createSvg();
  };

  self.draw = function(data) {
    if (data.length < 1) {
      self.clear();
      return;
    }
    if (svg) {
      svg.selectAll('circle').data(data, function(d) { return d._id; })
      .enter().append('circle')
      .attr('r', 10)
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; });
    }
  };
}