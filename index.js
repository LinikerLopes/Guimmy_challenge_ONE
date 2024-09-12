const {select, input, checkbox} = require('@inquirer/prompts')
const fs = require("fs").promises // guardar e reutilizar os livros

//aqui virá um objeto - require me dara um objeto
//importando modulos
let mensagem = "Bem vindo ao app Bibioteca KND - A biblioteca do Bairro";

let livros
//carrega livros do arquivo json declarado
const carregarLivros = async () =>{
    try{
        const dados = await fs.readFile("livros.json", "utf-8")
            livros = JSON.parse(dados)
    }
    catch(erro){
        livros = []
    }
}

const salvarLivros = async () =>{
    await fs.writeFile("livros.json", JSON.stringify(livros, null, 2)) //config arq json
}
// =========================================================== input do usuário para cadastro do livro ===== obs.: tornar isso privado mais para frente
const cadastrarLivro = async ()=>{
    const livro = await input ({ message: "Digita o nome do livro: "})
    const autor_livro = await input ({ message: "Digita nome do autor: "})
    const ano_livro = await input ({ message: "Digita ano do livro: "})

if(livro.length == 0){
        mensagem = "Nenhum livro cadastrado"
        return
    }

        if(livro.length == 0){
            mensagem = 'A caixa de cadastro de livros não pode estar vazia'
            return
        }

        livros.push(
            {value: livro, autor_livro, ano_livro,  checked: false}
        )
        mensagem = "Livro cadastrado com sucesso!"
    }

const listarLivros = async() =>{

    if(livros.length == 0){
        mensagem = "Não há livros cadastrados / disponíveis no banco de dados"
        return
    }

    const respostas = await checkbox({
        message: "Use as setas para mudas de livro, o espaço para marcar e desmarcar e o enter para finalizar essa etapa",
        message: "|=========== Titulo ========== |",
        choices: [...livros], //... - spread operator -pega tudo que tem e joga no array
        instructions: false,
    })

    livros.forEach((m) => {
        m.checked = false
    })

    if (respostas.length == 0){
        mensagem = "Nenhuma livro selecionada"
        return
    } 

   
    respostas.forEach((resposta) => {
        const livro = livros.find((m) => {
            return m.value == resposta
        })
        livro.checked = true
    })

    mensagem = "Livros marcadas como concluidas"
}

const emprestado = async () => {       //Higher Order Functions - Find, ForEach , Map e Filter
    if(livros.length == 0){
        mensagem = "Não há livros emprestados no momento. Escolha um na opção Listar livros"
        return
    }

    const emprestados = livros.filter((livro) => {
        return livro.checked
    })              
    if(emprestados.length == 0){
        mensagem = 'Não existe livros emprestados! :('
        return
    }
    await select({
        message: emprestados.length + " emprestados no momento.",
        choices: [...emprestados]
    })
}

const livrosDisponiveis = async () =>{

    if(livros.length == 0){
        mensagem = "Não existem livros"
        return
    }

    const disponiveis = livros.filter((livro) => {
        return livro.checked != true
    })

    if(disponiveis.length == 0){
        mensagem = "Não existem livros disponiveis! =)"
        return
    }

    await select({
        message: disponiveis.length + " livros disponiveis para emprestimo.",
        choices: [...disponiveis]        // 22min25s
    })
}

//=================================================== deletar livro ==== obs.: tornar privado 
const deletarLivros = async() =>{

    if(livros.length == 0){
        mensagem = "Não existem livros"
        return
    }

    const livrosDesmarcadas = livros.map((livro) => {

        return {value: livro.value, checked: false}
    })

    const itemsADeletar = await checkbox({
        message: "Selecione item para deletar",
        choices: [...livrosDesmarcadas],
        instructions: false,
    })
    if (itemsADeletar.length == 0){
        mensagem = "Nenhum item para deletar"
        return
    }

    itemsADeletar.forEach((item) =>{
        livros = livros.filter((livro) => {
            return livro.value != item
        })
    })
    mensagem = "Livros deletadas com sucesso"
}

// =========================================== Limpeza do console a cada interação com o menu ======
const mostrarMensagem = () => {
    console.clear();

    if(mensagem != ""){
        console.log(mensagem)
        console.log("")
        mensagem = ""
    }
}

const start = async () => {

    await carregarLivros()

    while(true){
        mostrarMensagem()
        await salvarLivros()

        const opcao = await select({
            message: "Menu >",
            choices: [
                {
                    name: "Cadastrar livros",
                    value: "cadastrar"
                },
                {
                    name: "Listar livros",
                    value: "listar"
                },
                {
                    name: "Livros emprestados",
                    value: "emprestado"
                },
                {
                    name: "Livros disponíveis ",
                    value: "disponiveis"
                },
                {
                    name: "Deletar livros",
                    value: "deletar"
                },
                {
                    name: "Sair",
                    value: "sair"
                }
            ]
        })
        
        switch (opcao) {
            case "cadastrar":
                await cadastrarLivro()
                break
            case "listar":
                await listarLivros()
                break
            case "emprestado":
                await emprestado()
                break
            case "disponiveis":
                await livrosDisponiveis()
                break
            case "deletar":
                await deletarLivros()
                break
            case "sair":
                return
        }
    }
}

start()

