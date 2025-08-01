const agentesRepository = require('../repositories/agentesRepository')
const { v4: uuidv4 } = require('uuid')
const handlerError = require('../utils/errorHandler')

const getAllAgentes = (req, res) => {
    try {
        const { cargo, dataDeIncorporacao, orderBy, order } = req.query
        let agentes = agentesRepository.findAll()
        const { dataInicio, dataFim } = req.query

        if (dataInicio || dataFim) {
            agentes = agentes.filter(agente => {
                const data = new Date(agente.dataDeIncorporacao)
                const inicio = dataInicio ? new Date(dataInicio) : null
                const fim = dataFim ? new Date(dataFim) : null

                return (!inicio || data >= inicio) && (!fim || data <= fim)
            })
        }

        if (cargo) {
            const cargosValidos = ['inspetor', 'delegado', 'investigador', 'escrivao', 'policial']
            if (!cargosValidos.includes(cargo.toLowerCase()))
                return res.status(400).json({ message: `Cargo inválido. Use um dos seguintes valores: ${cargosValidos.join(', ')}` })

            agentes = agentes.filter(agente =>
                agente.cargo && agente.cargo.toLowerCase() === cargo.toLowerCase()
            )
        }

        if (dataDeIncorporacao) {
            if (!validarData(dataDeIncorporacao))
                return res.status(400).json({ message: 'Data de incorporação inválida. Use o formato YYYY-MM-DD e não informe datas futuras.' })

            agentes = agentes.filter(agente => agente.dataDeIncorporacao === dataDeIncorporacao)
        }

        if (order && order !== 'asc' && order !== 'desc') {
            return res.status(400).json({ message: "Parâmetro 'order' inválido. Use 'asc' ou 'desc'." })
        }

        if (orderBy) {
            const camposValidos = ['nome', 'dataDeIncorporacao', 'cargo']
            if (!camposValidos.includes(orderBy)) {
                return res.status(400).json({ message: `Campo para ordenação inválido. Use: ${camposValidos.join(', ')}` })
            }

            agentes.sort((a, b) => {
                const ordem = order === 'desc' ? -1 : 1
                if (a[orderBy] < b[orderBy]) return -1 * ordem
                if (a[orderBy] > b[orderBy]) return 1 * ordem
                return 0
            })
        }

        res.status(200).json(agentes)
    } catch (error) {
        handlerError(res, error)
    }
}

const getAgenteById = (req, res) => {
    try {
        const { id } = req.params
        const agente = agentesRepository.findById(id)

        if (!agente)
            return res.status(404).json({ message: 'Agente não encontrado.' })

        res.status(200).json(agente)
    } catch (error) {
        handlerError(res, error)
    }
}

const createAgente = (req, res) => {
    try {
        const { nome, dataDeIncorporacao, cargo } = req.body
        const id = uuidv4()

        if (!validarData(dataDeIncorporacao))
            return res.status(400).json({ message: 'Data de incorporação inválida. Use o formato YYYY-MM-DD e não informe datas futuras.' })

        if (!nome || !dataDeIncorporacao || !cargo)
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' })

        const newAgente = { id, nome, dataDeIncorporacao, cargo }

        agentesRepository.create(newAgente)
        res.status(201).json(newAgente)
    } catch (error) {
        handlerError(res, error)
    }
}

const updateAgente = (req, res) => {
    try {
        const { id } = req.params
        const { nome, dataDeIncorporacao, cargo, id: idBody } = req.body

        if(idBody && idBody !== id)
            return res.status(400).json({message: "O campo 'id' não pode ser alterado."})

        if (!validarData(dataDeIncorporacao))
            return res.status(400).json({ message: 'Data de incorporação inválida. Use o formato YYYY-MM-DD e não informe datas futuras.' })

        if (!nome || !dataDeIncorporacao || !cargo)
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' })

        const agenteAtualizado = agentesRepository.update(id, { nome, dataDeIncorporacao, cargo })

        if (!agenteAtualizado)
            return res.status(404).json({ message: 'Agente não encontrado.' })

        res.status(200).json(agenteAtualizado)
    } catch (error) {
        handlerError(res, error)
    }
}

const patchAgente = (req, res) => {
    try {
        const { id } = req.params
        const updates = req.body
        const camposValidos = ['nome', 'dataDeIncorporacao', 'cargo']

        if('id' in updates)
            return res.status(400).json({message: "O campo 'id' não pode ser alterado."})

        const camposAtualizaveis = Object.keys(updates).filter(campo => camposValidos.includes(campo))

        if (updates.dataDeIncorporacao && !validarData(updates.dataDeIncorporacao))
            return res.status(400).json({ message: 'Data de incorporação inválida. Use o formato YYYY-MM-DD e não informe datas futuras.' })

        if (camposAtualizaveis.length === 0)
            return res.status(400).json({ message: 'Deve conter pelo menos um campo válido para atualização.' })

        const patchedAgente = agentesRepository.patchById(id, updates)

        if (!patchedAgente)
            return res.status(404).json({ message: 'Agente não encontrado.' })

        res.status(200).json(patchedAgente)
    } catch (error) {
        handlerError(res, error)
    }
}

const deleteAgente = (req, res) => {
    try {
        const { id } = req.params
        const agente = agentesRepository.findById(id)

        if (!agente)
            return res.status(404).json({ message: 'Agente não encontrado.' })

        agentesRepository.deleteById(id)
        res.status(204).send()
    } catch (error) {
        handlerError(res, error)
    }
}

const validarData = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/

    if (!regex.test(dateString)) return false

    const date = new Date(dateString)
    const today = new Date()

    if (isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dateString)
        return false

    if (date > today) return false

    return true
}

module.exports = {
    getAllAgentes,
    getAgenteById,
    createAgente,
    updateAgente,
    patchAgente,
    deleteAgente
}