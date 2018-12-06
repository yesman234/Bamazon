
// Require mysql to use it as a database, inquirer so a user can interact with that database however he/she chooses
var mysql = require("mysql");
var inquirer = require("inquirer");

// We're going to manage our nominees in style with this awesome package
var Table = require('cli-table');

// configure our connection with mysql and a local server
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "Garagec250",
    database: "Bamazonzz"
});

connection.connect(function (err) {
    if (err) throw err;
});

function review() {
    // Let's grab a list of all the products
    connection.query("SELECT * FROM products", function (err, res) {

        var table = new Table({
            //You can name these table heads chicken if you'd like. They are simply the headers for a table we're putting our data in
            head: ["ID", "product_name", "department_name", "price", "stock_quanity"],
            //These are just the width of the columns. Only mess with these if you want to change the cosmetics of our response
            colWidths: [10, 20, 15, 10, 10]
        });
    
        // table is an Array, so you can `push`, `unshift`, `splice` this is talking to sql needs to be exact syntax
        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].product_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quanity],
            );
        }
        console.log(table.toString());
        restart()
    });
}


function manageproducts() {
    inquirer.prompt([
        {
            type: "list",
            name: "userOptions",
            message: "What would you like to do",
            choices: ["view items for purchase", "Add items for sale", "Change price of items", "blind purchase"]
        }
    ]).then(function (answer) {
        switch (answer.userOptions) {
            case "view items for purchase":
                review();
                break;

            case "Add items for sale":
                add();
                break;

            case "Change price of items":
               populateproducts(updatestock_quanity);
                break;

            case "blind purchase":
                populateproducts(remove);
                break;

            // case "Exit":
            //     exit();
            //     break;
        }
    })
}


function add() {
    inquirer.prompt([{
        name: "product_name",
        message: "\nEnter the name of the product\n"
    }, {
        name: "department_name",
        message: "How many department_name has the product run\n"
    }, {
        name: "price",
        message: "Enter the price.\n"
    }, {
        name: "stock_quanity",
        message: "Give it a stock_quanity.\n"

    }]).then(function(answers){
        connection.query("INSERT INTO products SET ?", {
            product_name: answers.products_name,
            department_name: answers.department_name,
            price: answers.price,
            stock_quanity: answers.stock_quanity
        })
        review()
    })
}

function populateproducts(crud){
    options = []
    connection.query("SELECT * FROM products", function (err, res) {
        
        for (var i = 0 ; i < res.length ; i++) {
            options.push(res[i].product_name)
        }
        crud(options)
    })


}

function updatestock_quanity(list) {

    inquirer.prompt([{
       name: "product",
       type: "list",
       message: "Which product do you want to change the stock_quanity for",
       choices: list
    }, {
        name: "stock_quanity",
        message: "Enter the new stock_quanity"
    }]).then(function(answers){
        connection.query("UPDATE products SET ? WHERE?",[{
            stock_quanity: parseFloat(answers.stock_quanity)
        },{
            product_name: answers.product_name
        }], 
        function(err, res) {
            console.log("Here is an updated list of the products:")
            review()
           
        }
    )
    })

    
}

function remove(list) {
    inquirer.prompt([{
        name: "delete",
        type: "list",
        choices: options,
        message: "Who is getting booted from the products?"
    }]).then(function(answer){
        connection.query("DELETE FROM products WHERE ?",{
            product_name: answer.delete
        })
        review()
       
    })

}

function restart() {
    inquirer.prompt([{
        type: "list",
        name: "continue",
        choices: ["Yes", "No"],
        message: "Would you like to do more?\n"
    }]).then(function(answers) {
        if (answers.continue === "Yes") {
            manageproducts();
        } else {
           exit()
        }

    });
}

function exit() {
    console.log("Thanks for shopping and selling with Bamazonzz.")
    connection.end()
}

manageproducts()
