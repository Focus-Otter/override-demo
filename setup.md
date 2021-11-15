Amplify Override Project

Abandoned Shopping Cart Deletion

In this project, I’ll poll the audience on what kind of products we should sell, from there we imagine a storefront that only holds on to shopping cart information for 1 week and then those items are deleted.

To speed up the time and verify our solution, we will set a time of 2 minutes for items to be marked as ready for deletion

[Image: Screen Shot 2021-11-12 at 3.28.02 AM.png]Everytime an item is added to the cart, the ttl for the cart is updated. The user can verify their cart contents by clicking the View Cart button.

[Image: Screen Shot 2021-11-12 at 3.28.35 AM.png]
Backend

## backend config

- amplify add auth (accept defaults)
- amplify add api
  - rest
  - api name: overridedemo
  - path: /cart-items
  - storage:
    ttl: number
    userId: String
    cartItems: List

* Auth overrides
  - import { AmplifyAuthCognitoStackTemplate } from '@aws-amplify/cli-extensibility-helper'
    export function override(resources: AmplifyAuthCognitoStackTemplate) {
    resources.userPool.policies = {
    passwordPolicy: {
    ...resources.userPool.policies.passwordPolicy,
    temporaryPasswordValidityDays: 1,
    },
    }
    }
* API GW w/ DDB integration overrides
* import { AmplifyDDBResourceTemplate } from '@aws-amplify/cli-extensibility-helper'
  export function override(resources: AmplifyDDBResourceTemplate) {
  resources.dynamoDBTable.timeToLiveSpecification = {
  attributeName: 'ttl',
  enabled: true,
  }
  }

---

> app.js backend code

2 things change:

1. `userIdPrsent` gets set to `true`
2. `ttl` gets added to the payload: `ttl: Math.floor(Date.now() / 1000) + 60`

(already updated in below code snippet)

```js
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
	res.header('Access-Control-Allow-Origin', '_')
	res.header('Access-Control-Allow-Headers', '_')
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

/********************\*********************

- HTTP Get method for get single object \*
  ********************\*********************/

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

/****************\*\*\*\*****************

- HTTP post method for insert object \*
  ******************\*******************/

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

/******************\*\*******************

- HTTP remove method to delete object \*
  ******************\*\*\*******************/

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
```

## fronted config

fetch items for user:

```js
useEffect(() => {
	const getCartItems = async () => {
		const data = await API.get('overridedemo', '/cartitems/object/user')
		console.log(data)
	}
	getCartItems()
}, [])
```

post/update cart items for user:

```js
const handleAddToCart = async (product) => {
	setCartItems([...cartItems, product])
	await API.post('overridedemo', '/cartitems', {
		body: { products: [...cartItems, product] },
	}).catch((e) => console.log('uh oh...', e))
}
```
