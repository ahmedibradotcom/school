import nc from 'next-connect'
import dbConnect from '../../../utils/db'
import { isAuth } from '../../../utils/auth'
import Student from '../../../models/Student'
import Subject from '../../../models/Subject'
import Teacher from '../../../models/Teacher'

const handler = nc()
handler.use(isAuth)

handler.post(async (req, res) => {
  await dbConnect()
  const { classRoom, subject } = req.body
  const teacher = req.user.group === 'teacher' && req.user.teacher

  if (!teacher) {
    return res
      .status(400)
      .send(`${req.user.name}, your are not a teacher of this classroom`)
  }

  const teacherObj = await Teacher.findById(teacher)

  if (teacherObj && !teacherObj.subject.includes(subject)) {
    return res
      .status(400)
      .send(`${req.user.name}, your are not a teacher of this subject`)
  }

  const obj = await Student.find({ classRoom, isActive: true })
    .sort({ createdAt: -1 })
    .populate('pTwelveSchool')
    .populate('branch')
    .populate('classRoom')
  if (obj.length === 0) {
    return res
      .status(404)
      .send('No students associated the classroom you selected')
  }
  res.send({ student: obj, subject: await Subject.findById(subject) })
})

export default handler
