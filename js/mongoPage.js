var MongoClient = require('mongoose');
var DB_CONN_STR = 'mongodb://localhost:27017/li';
const express = require('express');
const app = express();
const path = require('path');
var http = require('http');
var querystring = require('querystring');
var params;
app.use(express.static(path.join(__dirname, 'public')))
app.listen(80, () => {
    console.log(`App listening at port 8080`);
})
app.post("/postPage",function(req,res){
    req.on('data',function(data){
        params = querystring.parse(data.toString());
        MongoClient.connect(DB_CONN_STR, function(err, db) {
            console.log("连接成功！");
            insertData(db, function(result) {
                console.log(result);
                res.status(200).json(result);
                db.close();
            });
        });
    })
})
app.get("/selectPage",function(req,res){
        MongoClient.connect(DB_CONN_STR, function(err, db) {
            console.log("连接成功！");
            selectData(db, function(result) {
                console.log(result);
                res.status(200).json(result);
                db.close();
            });
        });

})

var insertData = function(db, callback) {
    //连接到表 site
    var collection = db.collection('page');
    //插入数据
    var data = params;
    collection.insert(data, function(err, result) {
        if(err)
        {
            console.log('Error:'+ err);
            return;
        }
        callback(result);
    });
}
var selectData = function(db, callback) {
    //连接到表 site
    var collection = db.collection('page');
    //插入数据
    collection.find().toArray(function(err, result) {
        if(err)
        {
            console.log('Error:'+ err);
            return;
        }
        callback(result);
    });
}
app.get("/du",function (req, res) {
    MongoClient.connect(DB_CONN_STR, function(err, db) {
        console.log("连接成功！");
        find("page",{"age":{$gt:50}},{"pageamount":5,"page":page},function (err,result) {
            if(err) {
                console.log(err);
            }
            res.send(result);
        });
    });
    var page = parseInt(req.query.page); //express中读取get参数很简单
    console.log(page);
});
var find = function (collectionName,json,C,D) {
    var result = [];
    if(arguments.length == 3) {
        //如果没有传args
        //那么参数C就是callback,参数D没有传。
        var callback = C;
        var skipnumber = 0;
        //数目限制,limit(0)就是没有限制
        var limit = 0;
    }else if(arguments.length == 4) {
        var args = C;
        var callback = D;
        //应该省略的条数
        var skipnumber = args.pageamount * args.page;
        //数目限制
        var limit = args.pageamount;
    }else {
        throw new Error("find函数的参数个数，必须是3个，或者4个");
        return;
    }
    //从第零页开始
    console.log("略过了"+skipnumber+"条"+"限制在"+limit+"条");
    //链接数据库，链接之后查找所有
    MongoClient.connect(DB_CONN_STR,function (err,db) {
        console.log(collectionName,json,skipnumber,limit);
        var cursor = db.collection(collectionName).find().limit(limit).skip(skipnumber);
        // console.log(cursor);
        cursor.each(function (err, doc) {
            if(err) {
                console.log(111);
                callback(err,null);
                return;
            }
            if(doc != null) {
                console.log(doc)
                result.push(doc); //放入结果数组
            }else {
                //遍历结束，没有更多的文档
                callback(null,result);
                console.log("err");
            }
        });
    });
}


