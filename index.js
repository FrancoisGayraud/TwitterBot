var express = require("express");
var app = express();
app.get('/', function(req, res){ res.send('email qsdf'); });
app.listen(process.env.PORT || 5000);

var config = {
    me: 'theyCallMeByun', // The authorized account with a list to retweet.
    myList: 'tech', // The list we want to retweet.
    regexFilter: '', // Accept only tweets matching this regex pattern.
    regexReject: '(RT|@)', // AND reject any tweets matching this regex pattern.

    keys: {
        consumer_key: '0w6ClKqd9iCfdiK3dVdda6p2J',
        consumer_secret: '2OTU85T6hcJAknbu0yB677E6nRQsglXBpVwdjiPHuuoS20GeKS',
        access_token_key: '936246824406482944-HhSeX8UnmnzMUtCdZeIlsCNV7SCQoUu',
        access_token_secret: 'P79ffBz8ceJdPt8tO7vb6zEsPE67JoW5HPLeIngqaw9YJ'
    },
};

function getListMembers(callback) {
    var memberIDs = [];

    tu.listMembers({owner_screen_name: config.me,
        slug: config.myList
    },
    function(error, data){
        if (!error) {
            for (var i=0; i < data.users.length; i++) {
                memberIDs.push(data.users[i].id_str);
            }
            callback(memberIDs);
        } else {
            console.log(error);
            console.log(data);
        }
    });
}

function onReTweet(err) {
    if(err) {
        console.error("retweeting failed :(");
        console.error(err);
    }
}

function onTweet(tweet) {
    var regexReject = new RegExp(config.regexReject, 'i');
    var regexFilter = new RegExp(config.regexFilter, 'i');
    if (config.regexReject !== '' && regexReject.test(tweet.text)) {
        return;
    }
    if (regexFilter.test(tweet.text)) {
        console.log(tweet);
        console.log("RT: " + tweet.text);
        tu.retweet({
            id: tweet.id_str
        }, onReTweet);
    }
}

function listen(listMembers) {
    tu.filter({
        follow: listMembers
    }, function(stream) {
        console.log("listening to stream");
        stream.on('tweet', onTweet);
    });
}

var tu = require('tuiter')(config.keys);

getListMembers(listen);

// BELOW IT RETWEET EVERY 50 MIN A RANDOM TWEET WITH HASHTAG OF MY CHOICE IN IT

var twit = require('twit');
var config = require('./config');
var Twitter = new twit(config);
var request = require('request');
var userId;

var retweet = function() {
    var params = {
        q: '#giveaway',
        result_type: 'recent',
        lang: 'fr'
    }
    Twitter.get('search/tweets', params, function(err, data) {
	    if (!err) {
		var retweetId = data.statuses[0].id_str;
		var userId = data.statuses[0].user.id_str;

		Twitter.post('statuses/retweet/:id', {
			id: retweetId
			    }, function(err, response) {
			if (response) {
			    console.log('Retweeted!!!');
			    Twitter.post('friendships/create', {
				    user_id: userId
					}, function(err, response){
				    if (response)
					console.log('FOLLOWED');
				    else if (err)
					console.log('FOLLOWED DIDNT WORK');
				})
			}
			if (err) {
			    console.log('Something went wrong while RETWEETING... Duplication maybe...');
			}
		    });
	    }
	    // if unable to Search a tweet
	    else {
		console.log('Something went wrong while SEARCHING...');
	    }
	});
}

retweet();
setInterval(retweet, 1500000);