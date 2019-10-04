const express = require('express')
const Reminder = require('../models/reminder')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/reminders', auth, async (req, res) => {
    const reminder = new Reminder({
        ...req.body,
        owner: req.user._id
    })

    try {
        await reminder.save()
        res.status(201).send(reminder)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/reminders', auth, async (req, res) => {
    try {
        await req.user.populate('reminders').execPopulate()
        res.send(req.user.reminders)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/reminders/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const reminder = await Reminder.findOne({ _id, owner: req.user._id })

        if (!reminder) {
            return res.status(404).send()
        }

        res.send(reminder)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/reminders/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const reminder = await Reminder.findOne({ _id: req.params.id, owner: req.user._id})

        if (!reminder) {
            return res.status(404).send()
        }

        updates.forEach((update) => reminder[update] = req.body[update])
        await reminder.save()
        res.send(reminder)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/reminders/:id', auth, async (req, res) => {
    try {
        const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!reminder) {
            res.status(404).send()
        }

        res.send(reminder)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router
