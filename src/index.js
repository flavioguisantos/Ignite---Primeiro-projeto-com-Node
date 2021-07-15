const express = require("express")
const { v4: uuidv4 }  = require("uuid")
const app = express()
app.use(express.json())
const customers = []

// middlware
function verifyIfExistsAccountCPF(req, res, next) {
  const { cpf } = req.headers
  const customer = customers.find(c => c.cpf === cpf)
  if (!customer) {
    return res.status(404).json({Error: "customer not found"})
  }
  req.customer = customer
  return next()
}

function getBalances(statement) {
  const balance = statement.reduce((acc, item) => {
    
    if (item.type === "credit") {
      return acc + item.amount
    } else {
      return acc - item.amount
    }
  }, 0)
  return balance
}


app.post("/account", (req, res) => {
    const { cpf, name } = req.body
    const customersAlreadyExist = customers.some(c => c.cpf === cpf)
    if (customersAlreadyExist) {
        return res.status(409).json({Error: "customer already exists"})
    }
    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: [],
    })
    return res.status(201).send({ msg: "customer created", cpf: cpf })
})

app.get("/statement", verifyIfExistsAccountCPF, (req, res) => {
    const { customer } = req 
    return res.status(200).json(customer.statement)   
})

app.post("/deposit", verifyIfExistsAccountCPF, (req, res) => {
    const { description, amount } = req.body

    const { customer } = req

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit",
    }

    customer.statement.push(statementOperation)

    return res.status(201).json({msg: "deposit done"})

})

app.post("/withdraw", verifyIfExistsAccountCPF, (req, res) => {
    const { amount } = req.body
    const { customer } = req

    const balance = getBalances(customer.statement)

    if (balance < amount) {
        return res.status(400).json({Error: "insufficient funds"})
    }
    const statementOperation = {
        description: "Withdrawal",
        amount,
        created_at: new Date(),
        type: "debit",
    }
    customer.statement.push(statementOperation)
    return res.status(201).json({msg: "withdraw done"})

})

app.listen(3333, () => {
    console.log("Listening on http://localhost/3333/")
})

