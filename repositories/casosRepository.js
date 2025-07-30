const casos = [
    {
        id: "f5fb2ad5-22a8-4cb4-90f2-8733517a0d46",
        titulo: "homicidio",
        descricao: "Disparos foram reportados às 22:33 do dia 10/07/2007 na região do bairro União, resultando na morte da vítima, um homem de 45 anos.",
        status: "aberto",
        agente_id: "401bccf5-cf9e-489d-8412-446cd169a0f1"
    },
   
];

const findAll = () => casos;

const findById = (id) => casos.find(caso => caso.id === id);

const create = (newCase) => {
    casos.push(newCase);
};

const update = (id, titulo, descricao, status, agente_id) => {
    const caso = casos.find(c => c.id === id);

    if (caso) {
        caso.titulo = titulo;
        caso.descricao = descricao;
        caso.status = status;
        caso.agente_id = agente_id;
        return caso;
    }

    return null;
};

const patchById = (id, updates) => { 
    const caso = casos.find(caso => caso.id === id);

    if (!caso) return null;

    Object.keys(updates).forEach(prop => { 
        if (updates[prop] !== undefined) 
            caso[prop] = updates[prop];
    });

    return caso;
};


const deleteById = (id) => {
    const index = casos.findIndex(caso => caso.id === id);

    if (index !== -1) {
        const removido = casos.splice(index, 1); 
        return removido[0]; 
    } else {
        return null;
    }
};

module.exports = {
    findAll,
    findById,
    create,
    update,
    patchById,
    deleteById
};