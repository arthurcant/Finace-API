const { response, request } = require("express");
const express = require("express");
const { type } = require("express/lib/response");
const res = require("express/lib/response");
const { v4 } = require('uuid');

const app = express()

app.use(express.json())

const customers = []

function verifyAlreadyExistCPF(request, response, next) {
    const { cpf } = request.headers;

    const customer = customers.find((element) => element.cpf == cpf);

    if(!customer) {
        return response.status(406).json({erro:"Cpf already exist."})
    }

    request.customer = customer;
    
    return next();
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
        type: "Credit",
        statement: []
    }

    customers.push(information);

    return response.status(200).send(customers)
})

app.get("/statement/:cpf", (request, response) => {
    const { cpf } = request.params;

    const customer = customers.find((element) => element.cpf == cpf)

    if(!customer) {
        return response.status(400).json({erro:"Cpf already exist."})
    }

    return response.send(customer.statement);

})

app.post("/deposit", (request, response) => {
    const { cpf } = request.headers
    const { description, amount } = request.body
    
    const customer = customers.find((element) => element.cpf == cpf);

    if(!customer) {
        return response.status(400).json({error: "Cpf doesn't exist."})
    }

    const statementOperation = {
        description,
        amount,
        date: new Date(),
        type: "Debit"
    }

    customer.statement.push(statementOperation);

    return response.status(201).send(statementOperation);
})

app.get("/allAccount", (request, response) => {
    return response.status(201).json({customers})
})

app.listen(3334)


