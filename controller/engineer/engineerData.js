const Engineer = require('../../models/engineer.js')

const dataController = {}

dataController.index = async (req,res,next) => {
   try{
    const user = await req.user.populate('engineers')
    res.locals.data.engineers =  user.engineers
    next()
  } catch(error){
    res.status(400).send({ message: error.message })
  }
}

dataController.destroy = async (req,res,next) => {
    try {
        await Engineer.findOneAndDelete({'_id': req.params.id}).then(() => {
            next()
        })
    } catch(error) {
        res.status(400).send({ message: error.message })
    }
}

dataController.update = async (req,res,next) => {
    if (req.body.available === 'on'){
        req.body.available = true;
    } else if (req.body.available !== true) {
        req.body.available = false;
    }
    try {
        res.locals.data.engineer = await Engineer.findByIdAndUpdate(req.params.id, req.body, {new: true})
        next()
    } catch(error) {
        res.status(400).send({ message: error.message })
    }
}

dataController.create = async (req,res,next) => {
    if (req.body.available === 'on'){
        req.body.available = true;
    } else if (req.body.available !== true) {
        req.body.available = false;
    }
    try {
        res.locals.data.engineer = await Engineer.create(req.body)
        req.user.engineers.addToSet({_id: res.locals.data.engineer._id})
        await req.user.save()
        next()
    } catch(error) {
        res.status(400).send({ message: error.message })
    }
}

dataController.show = async (req,res,next) => {
    try {
        res.locals.data.engineer = await Engineer.findById(req.params.id)
        if(!res.locals.data.engineer){
            throw new error (`Could not locate an engineer with the id ${req.params.id}`)
        }
        next()
    } catch(error) {
        res.status(400).send({ message: error.message })
    }
}

module.exports = dataController