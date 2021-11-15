const AWS = require('aws-sdk')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
var bodyParser = require('body-parser')
var express = require('express')

AWS.config.update({ region: process.env.TABLE_REGION })

const dynamodb = new AWS.DynamoDB.DocumentClient()

let tableName = 'productstable'
if (process.env.ENV && process.env.ENV !== 'NONE') {
	tableName = tableName + '-' + process.env.ENV
}

const userIdPresent = true
const partitionKeyName = 'userId'
const partitionKeyType = 'S'
const sortKeyName = ''
const sortKeyType = ''
const hasSortKey = sortKeyName !== ''
const path = '/cartitems'
const UNAUTH = 'UNAUTH'
const hashKeyPath = '/:' + partitionKeyName
const sortKeyPath = hasSortKey ? '/:' + sortKeyName : ''
// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*')
	res.header('Access-Control-Allow-Headers', '*')
	next()
})

// convert url string param to expected Type
const convertUrlType = (param, type) => {
	switch (type) {
		case 'N':
			return Number.parseInt(param)
		default:
			return param
	}
}

/*****************************************
 * HTTP Get method for get single object *
 *****************************************/

app.get(path + '/object' + hashKeyPath + sortKeyPath, function (req, res) {
	var params = {}
	if (userIdPresent && req.apiGateway) {
		params[partitionKeyName] =
			req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH
	} else {
		params[partitionKeyName] = req.params[partitionKeyName]
		try {
			params[partitionKeyName] = convertUrlType(
				req.params[partitionKeyName],
				partitionKeyType
			)
		} catch (err) {
			res.statusCode = 500
			res.json({ error: 'Wrong column type ' + err })
		}
	}
	if (hasSortKey) {
		try {
			params[sortKeyName] = convertUrlType(req.params[sortKeyName], sortKeyType)
		} catch (err) {
			res.statusCode = 500
			res.json({ error: 'Wrong column type ' + err })
		}
	}

	let getItemParams = {
		TableName: tableName,
		Key: params,
	}

	dynamodb.get(getItemParams, (err, data) => {
		if (err) {
			res.statusCode = 500
			res.json({ error: 'Could not load items: ' + err.message })
		} else {
			if (data.Item) {
				res.json(data.Item)
			} else {
				res.json(data)
			}
		}
	})
})

/************************************
 * HTTP post method for insert object *
 *************************************/

app.post(path, function (req, res) {
	if (userIdPresent) {
		req.body['userId'] =
			req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH
	}

	let putItemParams = {
		TableName: tableName,
		Item: {
			...req.body,
			ttl: Math.floor(Date.now() / 1000) + 60,
		},
	}
	dynamodb.put(putItemParams, (err, data) => {
		if (err) {
			res.statusCode = 500
			res.json({ error: err, url: req.url, body: req.body })
		} else {
			res.json({ success: 'post call succeed!', url: req.url, data: data })
		}
	})
})

/**************************************
 * HTTP remove method to delete object *
 ***************************************/

app.delete(path + '/object' + hashKeyPath + sortKeyPath, function (req, res) {
	var params = {}
	if (userIdPresent && req.apiGateway) {
		params[partitionKeyName] =
			req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH
	} else {
		params[partitionKeyName] = req.params[partitionKeyName]
		try {
			params[partitionKeyName] = convertUrlType(
				req.params[partitionKeyName],
				partitionKeyType
			)
		} catch (err) {
			res.statusCode = 500
			res.json({ error: 'Wrong column type ' + err })
		}
	}
	if (hasSortKey) {
		try {
			params[sortKeyName] = convertUrlType(req.params[sortKeyName], sortKeyType)
		} catch (err) {
			res.statusCode = 500
			res.json({ error: 'Wrong column type ' + err })
		}
	}

	let removeItemParams = {
		TableName: tableName,
		Key: params,
	}
	dynamodb.delete(removeItemParams, (err, data) => {
		if (err) {
			res.statusCode = 500
			res.json({ error: err, url: req.url })
		} else {
			res.json({ url: req.url, data: data })
		}
	})
})

app.listen(3000, function () {
	console.log('App started')
})

module.exports = app
