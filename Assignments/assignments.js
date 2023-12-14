1-Retrieve the names of all customers

mongo__mongoassignment> db.customers.find({},{_id:false,city:false})
[
  { name: 'john doe' },
  { name: 'jane smith' },
  { name: 'david wang' },
  { name: 'lisa chen' }

mongo__mongoassignment> db.customers.find({},{_id:0,city:0})
[
  { name: 'john doe' },
  { name: 'jane smith' },
  { name: 'david wang' },
  { name: 'lisa chen' }
]
mongo__mongoassignment>
------------------------------------------------------------------------------------------------------------
2-Retrieve the total number of orders placed.

mongo__mongoassignment> db.order.countDocuments()

mongo__mongoassignment> db.order.countDocuments({})
4
------------------------------------------------------------------------------------------------------------
3-Retrieve the details of the order with OrderID 1003.

mongo__mongoassignment> db.order.find({orderId:1003})
[
  {
    _id: ObjectId('6571841719cd615a02ac2e8d'),
    orderId: 1003,
    customerId: 3,
    total: 300
  }
]
------------------------------------------------------------------------------------------------------------
4-Retrieve the names of customers who are from Beijing.

mongo__mongoassignment> db.customers.find({city:"beijing"},{_id:false,city:false})
[ { name: 'david wang' } ]
------------------------------------------------------------------------------------------------------------
5-Retrieve the total price of all orders.

mongo__mongoassignment> db.order.aggregate([{ $group: {_id:null, totalAmt: {$sum: "$total" } } }] )
[ { _id: null, totalAmt: 770 } ]
------------------------------------------------------------------------------------------------------------
6-Retrieve the product names and their prices.

mongo__mongoassignment> db.products.find({},{producttID:0,_id:0})
[
  { ProductName: 'laptop', price: 1000 },
  { ProductName: 'Smartphone', price: 800 },
  { ProductName: 'Tablet', price: 500 },
  { ProductName: 'TV', price: 1500 }
]
------------------------------------------------------------------------------------------------------------
7-Retrieve the names of customers along with their city.

mongo__mongoassignment> db.customers.find({},{_id:0})
[
  { name: 'john doe', city: 'new york' },
  { name: 'jane smith', city: 'new york' },
  { name: 'david wang', city: 'beijing' },
  { name: 'lisa chen', city: 'shanghai' }
]
------------------------------------------------------------------------------------------------------------
8-Retrieve the orders placed by John Doe (CustomerID 1)

mongo__mongoassignment> db.order.aggregate([{$match:{customerId:1}}])
[
  {
    _id: ObjectId('6571841719cd615a02ac2e8b'),
    orderId: 1001,
    customerId: 1,
    total: 200
  },
  {
    _id: ObjectId('6571841719cd615a02ac2e8e'),
    orderId: 1004,
    customerId: 1,
    total: 120
  }
]
------------------------------------------------------------------------------------------------------------
9-Retrieve the customers who have placed orders.
mongo__mongoassignment> db.getCollection("order").aggregate(
... [{                                                                                                                                    
... $lookup:{                                                                                                                             
... from:'customers',
... localField:"customerId",
... foreignField:"_id",
... as:"result"
... }                                                                                                                                     
... },                                                                                                                                    
... {                                                                                                                                     
... $project:{
... _id:0,                                                                                                                                
... 'result.name':1
... }                                                                                                                                     
... }                                                                                                                                     
... ],                                                                                                                                    
... {maxTimeMS:60000,allowDiskUse:true})
[
  { result: [ { name: 'john doe' } ] },
  { result: [ { name: 'jane smith' } ] },
  { result: [ { name: 'david wang' } ] },
  { result: [ { name: 'john doe' } ] }
]
------------------------------------------------------------------------------------------------------------
10-Retrieve the orders placed by customers from Shanghai.
mongo__mongoassignment> db.order.aggregate([ { $lookup:{ from:"customers", localField:"customerId", foreignField:"_id", as:"result", } }, { $match:{ "result.city":"shanghai" } }, { $project:{ "_id":0, "orderId":1,"customerId":1,"total":1}}])
nobody has placed order from shanghai

mongo__mongoassignment> db.order.aggregate([ { $lookup:{ from:"customers", localField:"customerId", foreignField:"_id", as:"result", } }, { $match:{ "result.city":"new york" } }, { $project:{ "_id":0, "orderId":1,"customerId":1,"total":1}}])
[ { orderId: 1002, customerId: 2, total: 150 } ]
------------------------------------------------------------------------------------------------------------------------------
11-Retrieve the highest price from the Products table.
mongo__mongoassignment> db.products.aggregate([
... {                                                           
... $group:{
... _id:null,                                                   
... maxPrice:{$max:"$price"}
... }                                                           
... }                                                           
... ])                                                          
[ { _id: null, maxPrice: 1500 } ]
------------------------------------------------------------------------------------------------------------------------------
12-Retrieve the average price of all products.
mongo__mongoassignment> db.products.aggregate([ { $group: { _id: null, avgPrice: { $avg: "$price" } } }] )
[ { _id: null, avgPrice: 950 } ]
------------------------------------------------------------------------------------------------------------------------------
13-Retrieve the details of customers who have placed orders.
db.customers.aggregate([
  {
    $lookup: {
      from: "orders",
      localField: "_id",
      foreignField: "customerId",
      as: "ordersInfo"
    }
  },
  {
    $project: {
      _id: 1,
      name: 1,
      city: 1,
      orders: "$ordersInfo"
    }
  }
])


[
  {
    "_id": 1,
    "name": "john doe",
    "city": "new york",
    "orders": [
      {
        "_id": ObjectId("6571841719cd615a02ac2e8b"),
        "orderId": 1001,
        "customerId": 1,
        "total": 200
      },
      {
        "_id": ObjectId("6571841719cd615a02ac2e8e"),
        "orderId": 1004,
        "customerId": 1,
        "total": 120
      }
    ]
  },
  {
    "_id": 2,
    "name": "jane smith",
    "city": "new york",
    "orders": [
      {
        "_id": ObjectId("6571841719cd615a02ac2e8c"),
        "orderId": 1002,
        "customerId": 2,
        "total": 150
      }
    ]
  },
  {
    "_id": 3,
    "name": "david wang",
    "city": "beijing",
    "orders": [
      {
        "_id": ObjectId("6571841719cd615a02ac2e8d"),
        "orderId": 1003,
        "customerId": 3,
        "total": 300
      }
    ]
  }
]
------------------------------------------------------------------------------------------------------------------------------
14-Retrieve the names of customers who have not placed any orders.

db.customers.aggregate([
  {
    $lookup: {
      from: "orders",
      localField: "_id",
      foreignField: "customerId",
      as: "ordersInfo"
    }
  },
  {
    $match: {
      "ordersInfo": { $exists: false, $eq: [] }
    }
  },
  {
    $project: {
      _id: 0,
      name: 1
    }
  }
])

[
  { "name": "lisa chen" }
]

15-Retrieve the customer names along with the total order value.

db.customers.aggregate([
  {
    $lookup: {
      from: "orders",
      localField: "_id",
      foreignField: "customerId",
      as: "ordersInfo"
    }
  },
  {
    $unwind: "$ordersInfo"
  },
  {
    $group: {
      _id: {
        customerId: "$_id",
        name: "$name"
      },
      totalOrderValue: { $sum: "$ordersInfo.total" }
    }
  },
  {
    $project: {
      _id: 0,
      name: "$_id.name",
      totalOrderValue: 1
    }
  }
])
[
  { "name": "john doe", "totalOrderValue": 320 },
  { "name": "jane smith", "totalOrderValue": 150 },
  { "name": "david wang", "totalOrderValue": 300 },
  { "name": "lisa chen", "totalOrderValue": 120 }
]
------------------------------------------------------------------------------------------------------------------------------
16-Retrieve the orders placed in descending order of their total value.
mongo__mongoassignment> db.order.aggregate([
... {                                                           
... $sort:{                                                     
... total:-1                                                    
... }
... }                                                           
... ])                                                          
[
  {
    _id: ObjectId('6571841719cd615a02ac2e8d'),
    orderId: 1003,
    customerId: 3,
    total: 300
  },
  {
    _id: ObjectId('6571841719cd615a02ac2e8b'),
    orderId: 1001,
    customerId: 1,
    total: 200
  },
  {
    _id: ObjectId('6571841719cd615a02ac2e8c'),
    orderId: 1002,
    customerId: 2,
    total: 150
  },
  {
    _id: ObjectId('6571841719cd615a02ac2e8e'),
    orderId: 1004,
    customerId: 1,
    total: 120
  }
]
------------------------------------------------------------------------------------------------------------------------------
17-Retrieve the product names along with their prices, sorted by price in descending order.
mongo__mongoassignment> db.products.aggregate([{ $sort: { price: -1 } },{$project:{ProductName:1,price:1,_id:0}}])
[
  { ProductName: 'TV', price: 1500 },
  { ProductName: 'laptop', price: 1000 },
  { ProductName: 'Smartphone', price: 800 },
  { ProductName: 'Tablet', price: 500 }
]
------------------------------------------------------------------------------------------------------------------------------
18-Retrieve the names of customers along with the number of orders they have placed.
mongo__mongoassignment> db.customers.aggregate([ { $lookup: { from: "order", localField: "_id", foreignField: "customerId", as: "result" } }, { $project: { _id: 0, name: 1, OrderCount: { $size: "$result" } } }] )
[
  { name: 'john doe', OrderCount: 2 },
  { name: 'jane smith', OrderCount: 1 },
  { name: 'david wang', OrderCount: 1 },
  { name: 'lisa chen', OrderCount: 0 }
]
------------------------------------------------------------------------------------------------------------------------------
19-Retrieve the orders placed by customers from London.
db.orders.aggregate([
  {
    $lookup: {
      from: "customers",
      localField: "customerId",
      foreignField: "_id",
      as: "customerInfo"
    }
  },
  {
    $match: {
      "customerInfo.city": "london"
    }
  },
  {
    $project: {
      _id: 0,
      orderId: 1,
      customerId: 1,
      total: 1
    }
  }
])

[
  {
    "orderId": 1001,
    "customerId": 1,
    "total": 200
  }
]
------------------------------------------------------------------------------------------------------------------------------
20-Insert a new customer with ID 5, name 'Emma Wilson', and city 'Paris'.
mongo__mongoassignment> db.customers.insertOne({ _id: 5, name: "emma wilson", city: "paris" })
{ acknowledged: true, insertedId: 5 }
------------------------------------------------------------------------------------------------------------------------------
21-Update the city of the customer with ID 3 to 'Tokyo'.
mongo__mongoassignment> db.customers.updateOne({_id:3},{$set:{  
... city:"tokyo"}})
------------------------------------------------------------------------------------------------------------------------------22-Update the price of the product with ID 2 to 900
db.products.updateOne(
  { producttID: 2 },  // Filter criteria
  { $set: { price: 900 } }  // Update operation
)

db.products.find()
[
  {
    "_id": ObjectId('6571864319cd615a02ac2e8f'),
    "producttID": 1,
    "ProductName": "laptop",
    "price": 1000
  },
  {
    "_id": ObjectId('6571864319cd615a02ac2e90'),
    "producttID": 2,
    "ProductName": "Smartphone",
    "price": 900  
  },
  {
    "_id": ObjectId('6571864319cd615a02ac2e91'),
    "producttID": 3,
    "ProductName": "Tablet",
    "price": 500
  },
  {
    "_id": ObjectId('6571864319cd615a02ac2e92'),
    "producttID": 4,
    "ProductName": "TV",
    "price": 1500
  }
]
------------------------------------------------------------------------------------------------------------------------------
23-Delete the order with OrderID 1002.
mongo__mongoassignment> db.order.deleteOne({orderId:1002})
{ acknowledged: true, deletedCount: 1 }
mongo__mongoassignment> db.order.find()
[
  {
    _id: ObjectId('6571841719cd615a02ac2e8b'),
    orderId: 1001,
    customerId: 1,
    total: 200
  },
  {
    _id: ObjectId('6571841719cd615a02ac2e8d'),
    orderId: 1003,
    customerId: 3,
    total: 300
  },
  {
    _id: ObjectId('6571841719cd615a02ac2e8e'),
    orderId: 1004,
    customerId: 1,
    total: 120
  }
]
------------------------------------------------------------------------------------------------------------------------------
24-Retrieve the names of customers and their cities using aliases.
db.customers.aggregate([
  {
    $project: {
      _id: 0,
      customerName: "$name",
      customerCity: "$city"
    }
  }
])
[
  { "customerName": "john doe", "customerCity": "new york" },
  { "customerName": "jane smith", "customerCity": "new york" },
  { "customerName": "david wang", "customerCity": "beijing" },
  { "customerName": "lisa chen", "customerCity": "shanghai" }
]
------------------------------------------------------------------------------------------------------------------------------
25-Retrieve the customer names along with their total order value, sorted by order value in descending order.
db.customers.aggregate([
  {
    $lookup: {
      from: "orders",
      localField: "_id",
      foreignField: "customerId",
      as: "ordersInfo"
    }
  },
  {
    $unwind: "$ordersInfo"
  },
  {
    $group: {
      _id: {
        customerId: "$_id",
        name: "$name"
      },
      totalOrderValue: { $sum: "$ordersInfo.total" }
    }
  },
  {
    $sort: {
      totalOrderValue: -1
    }
  },
  {
    $project: {
      _id: 0,
      name: "$_id.name",
      totalOrderValue: 1
    }
  }
])
[
  { "name": "john doe", "totalOrderValue": 320 },
  { "name": "david wang", "totalOrderValue": 300 },
  { "name": "jane smith", "totalOrderValue": 150 },
  { "name": "lisa chen", "totalOrderValue": 120 }
]
------------------------------------------------------------------------------------------------------------------------------
26-Retrieve the customer names along with the number of orders they have placed, sorted by the number of orders in ascending order.
db.customers.aggregate([
  {
    $lookup: {
      from: "orders",
      localField: "_id",
      foreignField: "customerId",
      as: "ordersInfo"
    }
  },
  {
    $project: {
      _id: 0,
      name: 1,
      numberOfOrders: { $size: "$ordersInfo" }
    }
  },
  {
    $sort: {
      numberOfOrders: 1
    }
  }
])
[
  { "name": "lisa chen", "numberOfOrders": 1 },
  { "name": "jane smith", "numberOfOrders": 1 },
  { "name": "david wang", "numberOfOrders": 1 },
  { "name": "john doe", "numberOfOrders": 2 }
]
------------------------------------------------------------------------------------------------------------------------------
27-Retrieve the customer names along with the average order value, sorted by the average order value in descending order.
db.customers.aggregate([
  {
    $lookup: {
      from: "orders",
      localField: "_id",
      foreignField: "customerId",
      as: "ordersInfo"
    }
  },
  {
    $unwind: "$ordersInfo"
  },
  {
    $group: {
      _id: {
        customerId: "$_id",
        name: "$name"
      },
      averageOrderValue: { $avg: "$ordersInfo.total" }
    }
  },
  {
    $sort: {
      averageOrderValue: -1
    }
  },
  {
    $project: {
      _id: 0,
      name: "$_id.name",
      averageOrderValue: 1
    }
  }
])
------------------------------------------------------------------------------------------------------------------------------
28-Calculate the total price of all orders placed by customers from Beijing

db.customers.aggregate([
  {
    $match: {
      city: "beijing"
    }
  },
  {
    $lookup: {
      from: "orders",
      localField: "_id",
      foreignField: "customerId",
      as: "ordersInfo"
    }
  },
  {
    $unwind: "$ordersInfo"
  },
  {
    $group: {
      _id: null,
      totalPrice: { $sum: "$ordersInfo.total" }
    }
  },
  {
    $project: {
      _id: 0,
      totalPrice: 1
    }
  }
])
[
  {
    "totalPrice": 300
  }
]


------------------------------------------------------------------------------------------------------------------------------
29-Calculate the average price of products in the Tablet category.

db.products.aggregate([
  {
    $match: {
      ProductName: "Tablet"
    }
  },
  {
    $group: {
      _id: null,
      averagePrice: { $avg: "$Price" }
    }
  },
  {
    $project: {
      _id: 0,
      averagePrice: 1
    }
  }
])
[
  {
    "averagePrice": 500
  }
]
------------------------------------------------------------------------------------------------------------------------------
30-User Calculate the total revenue generated by each customer.
db.customers.aggregate([
  {
    $lookup: {
      from: "orders",
      localField: "_id",
      foreignField: "customerId",
      as: "ordersInfo"
    }
  },
  {
    $unwind: "$ordersInfo"
  },
  {
    $group: {
      _id: {
        customerId: "$_id",
        name: "$name"
      },
      totalRevenue: { $sum: "$ordersInfo.total" }
    }
  },
  {
    $project: {
      _id: 0,
      name: "$_id.name",
      totalRevenue: 1
    }
  }
])
[
  {
    "name": "John Doe",
    "totalRevenue": 320
  },
  {
    "name": "Jane Smith",
    "totalRevenue": 150
  },
]

