output = new Meteor.Stream('output');

if (Meteor.isClient) {

  Session.setDefault('output', "Meteor Shell 0.0.2\n\n"
            +"This is a basic terminal, it will run Linux/Unix commands on the server\n"
            +"and will print on the screen the output."
            +"\n\n"
            +"I did this software mainly to understand how the \"meteor deploy\"\n"
            +"PaaS/sandbox is done. Please don't do bad things :)"
            +"\n\n"
            +"source: http://github.com/grigio/meteor-shell\n"
            +"author: Luigi Maselli"
            +"\n\n"
            +"Known Bugs: some commands needs a page restart"
          );

  Template.buffer.helpers({
    output: function () {
      return Session.get('output');
    }
  });

  Template.buffer.created = function() {
    output.on('data', function(data) {
      var chars = [];
      _.each(data, function(char) {
        chars.push(String.fromCharCode(char));
      });
      Session.set('output', Session.get('output')+chars.join(''));
      //console.log(chars.join(''));
    });
  }

  Template.input.events({

    'keypress input#cmd': function (evt) {
      if (evt.which === 13) { // enter key
        var cmd  = $('#cmd').val();
        console.log('exec: '+cmd );
        Meteor.call('cmd', cmd, function (err, data) {
          $('#cmd').val('');
          Session.set('output', data );
        });
      }
    }

  });

  Template.analytics.rendered = function () {
    if (!window._gaq) {
      window._gaq = [];

      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

      ga('create', 'UA-40601149-4', 'meteor.com');
      ga('send', 'pageview');
    }
};

} // end client

if (Meteor.isServer) {

  output.permissions.read(function(userId, eventName) {
    return true;
  });

  Meteor.methods({

    cmd: function (command) {
      var explode = command.split(' ');
      var cmd = explode[0];
      var args = explode.splice(1, explode.length);
      //console.log("e:"+cmd+JSON.stringify(args));

      var spawn = Npm.require('child_process').spawn;
      if (args.length == 0)
        ls    = spawn(cmd);
      else
        ls    = spawn(cmd , args);

      ls.stdout.on('data', function (data) {
        //console.log(''+data);
        output.emit('data', data);
      });

      ls.stderr.on('data', function (data) {
        console.log(''+data);
        output.emit('data', data);
      });

      return '';
    }

  });
} // end server
