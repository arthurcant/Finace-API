const { response, request } = require("express");
const express = require("express");
const { type } = require("express/lib/response");
const res = require("express/lib/response");
const { v4 } = require('uuid');

const app = express()

app.use(express.json())

const customers = []

function verifyExistAccountCPF(request, response, next) {
    const { cpf } = request.headers;

    const customer = customers.find((element) => element.cpf == cpf);

    if(!customer) {
        return response.status(400).json({error: "Account doesn't exist." })
    }

    request.customer = customer;
    
    return next();
}

function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if(operation.type == "credit"){
            console.log("Line 30 was executed")
            return acc + operation.amount;
        } else {
            console.log("Line 33 was executed")
            return acc - operation.amount;
        }
    }, 0)

    return balance;
}

app.post("/account", (request, response) => {

    const { name, cpf } = request.body;

    const customer = customers.some((element) => element.cpf == cpf)

    if(customer) {
        return response.status(406).json({erro:"Cpf already exist."})
    }

    information = {
        cpf, 
        name,
        id:v4(),
        statement: []
    }

    customers.push(information);

    return response.status(200).send(customers)
})

app.get("/statement", verifyExistAccountCPF, (request, response) => {
    const { customer } = request;

    return response.send(customer.statement);
})

app.get("/statement/date", verifyExistAccountCPF, (request, response) => {
    const { date } = request.query;
    const { customer } = request;

    const dateFormat = new Date(date + " 00:00");

    const foundsElemets = customer.statement.filter((statement) => statement.date.toDateString() == (new Date(dateFormat)).toDateString())

    if (foundsElemets.length === 0) {
        return response.status(400).json({ error: "Doesn't exist any register were register with this date." })
    }

    return response.json(foundsElemets);
})

app.post("/deposit", verifyExistAccountCPF, (request, response) => {
    const { customer } = request
    const { description, amount } = request.body

    const statementOperation = {
        description,
        amount,
        date: new Date(),
        type: "credit"
    }

    customer.statement.push(statementOperation);

    return response.status(201).send(statementOperation);
})

app.put("/updateName", verifyExistAccountCPF, (request, response) => {
    const { customer } = request;
    const { name } = request.body;

    customer.name = name;

    return response.send(customer)
})

app.post("/withdraw", verifyExistAccountCPF, (request, response) => {
    const { amount } = request.body;
    const { customer } = request;

    const balance = getBalance(customer.statement);
   
    if(balance <= amount) {
        return response.status(406).json({error: "Insufficient balance for this withdraw."})
    }

    const statementOperation = {
        amount,
        create_at: new Date(),
        type:"Debit"
    }

    customer.statement.push(statementOperation)

    return response.status(201).send()
})

app.get("/account/:cpf", (request, response) => {
    const { cpf } = request.params;

    const customer = customers.find((element) => element.cpf == cpf);

    if(!customer) {
        return response.status(400).json({erro: "Cpf doesn't exist"})
    }
    return response.status(200).json(customer);
})

app.delete("/delete", verifyExistAccountCPF, (request, response) => {
    const { customer } = request;

    customers.splice(customer, 1);

    return response.status(200).send();
})

app.get("/allAccount", (request, response) => {
    return response.status(201).json(customers)
})

app.get("/balance", verifyExistAccountCPF, (request, response) => {
    const { customer } = request;

    const balance = getBalance(customer.statement)

    return response.status(200).json(balance);

})

app.listen(3334)
