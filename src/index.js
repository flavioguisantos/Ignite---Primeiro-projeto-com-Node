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
  res.customer = customer
  return next()
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

app.listen(3333, () => {
    console.log("Listening on http://localhost/3333/")
})

