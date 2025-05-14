import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const TAMANHO_BOTAO = width / 4.5;

export default function App() {
  const [valorExibido, setValorExibido] = useState('0');
  const [operandoAnterior, setOperandoAnterior] = useState(null);
  const [operadorSelecionado, setOperadorSelecionado] = useState(null); // Renomeado para clareza
  const [esperandoOperando, setEsperandoOperando] = useState(false);

  const aoPressionarNumero = (numero) => {
    if (valorExibido === 'Erro') { // Se houver erro, limpa antes de digitar novo número
      setValorExibido(String(numero));
      setEsperandoOperando(false); // Permite continuar normalmente
      // Não reseta o operadorSelecionado aqui, para permitir 5 + Erro -> C -> 5 + 3
    } else if (esperandoOperando) {
      setValorExibido(String(numero));
      setEsperandoOperando(false);
    } else {
      setValorExibido(valorExibido === '0' ? String(numero) : valorExibido + numero);
    }
  };

  const aoPressionarDecimal = () => {
    if (valorExibido === 'Erro') { // Se houver erro, não permite decimal
      return;
    }
    if (esperandoOperando) { // Se estiver esperando operando, começa com "0."
      setValorExibido('0.');
      setEsperandoOperando(false);
    } else if (!valorExibido.includes('.')) {
      setValorExibido(valorExibido + '.');
      setEsperandoOperando(false);
    }
  };

  const aoPressionarOperador = (proximoOperador) => {
    // Se o valor exibido for "Erro", e um operador for pressionado,
    // resetamos para '0' e definimos o novo operador.
    if (valorExibido === 'Erro') {
      setValorExibido('0');
      setOperandoAnterior(null); // Limpa operando anterior se estava em erro
      // O operadorSelecionado será definido abaixo
    }

    const valorEntrada = parseFloat(valorExibido);

    // Se já existe um operador e não estamos esperando um novo operando (ou seja, um número foi digitado após o último operador)
    // E o operandoAnterior não é nulo (temos uma operação anterior para calcular)
    if (operadorSelecionado && operandoAnterior !== null && !esperandoOperando) {
      const resultadoParcial = calcular(operandoAnterior, valorEntrada, operadorSelecionado);
      if (isNaN(resultadoParcial)) {
        setValorExibido('Erro');
        setOperandoAnterior(null);
        setOperadorSelecionado(null);
        setEsperandoOperando(true); // Espera uma nova entrada que limpará o erro
        return;
      }
      setValorExibido(String(parseFloat(resultadoParcial.toFixed(7))));
      setOperandoAnterior(resultadoParcial);
    } else {
      // Se não, apenas armazena o valor de entrada como o operando anterior.
      setOperandoAnterior(valorEntrada);
    }

    setEsperandoOperando(true); // Agora estamos esperando o próximo número
    setOperadorSelecionado(proximoOperador); // Define o novo operador como ativo
  };

  // Função de cálculo agora recebe os operandos e o operador como argumentos
  const calcular = (valAnterior, valAtual, op) => {
    const valorAnteriorNum = parseFloat(valAnterior);
    const valorAtualNum = parseFloat(valAtual);

    if (isNaN(valorAnteriorNum) || isNaN(valorAtualNum)) return NaN; // Retorna NaN se algum valor não for número

    switch (op) {
      case '+':
        return valorAnteriorNum + valorAtualNum;
      case '-':
        return valorAnteriorNum - valorAtualNum;
      case '*':
        return valorAnteriorNum * valorAtualNum;
      case '/':
        return valorAtualNum === 0 ? NaN : valorAnteriorNum / valorAtualNum; // Retorna NaN em divisão por zero
      default:
        return valorAtualNum;
    }
  };

  const aoPressionarIgual = () => {
    if (operadorSelecionado && operandoAnterior !== null) {
      if (valorExibido === 'Erro') { // Se já está em erro, não faz nada no igual
        return;
      }
      const resultado = calcular(operandoAnterior, parseFloat(valorExibido), operadorSelecionado);
      if (isNaN(resultado)) {
        setValorExibido('Erro');
      } else {
        setValorExibido(String(parseFloat(resultado.toFixed(7))));
      }
      // Mantém o resultado no operandoAnterior para cálculos contínuos (ex: 5 + 5 = 10, depois pressionar + e outro número)
      // Se quisermos que o igual finalize a cadeia, setOperandoAnterior(null)
      setOperandoAnterior(resultado); // Para permitir 2*3=6, depois *2=12
      setOperadorSelecionado(null); // Limpa o operador ativo após o igual
      setEsperandoOperando(true); // Espera uma nova entrada, que pode ser um número (inicia novo cálculo) ou operador (continua com resultado)
    }
  };

  const aoPressionarLimpar = () => {
    if (valorExibido === '0' && operandoAnterior === null && operadorSelecionado === null) { // Comportamento AC
      // Já está tudo limpo, não precisa fazer nada extra ou se for AC
    } else if (esperandoOperando && operadorSelecionado && valorExibido !== 'Erro') { // Comportamento C quando um operador está ativo
      // Se um operador está ativo e estamos esperando o próximo operando,
      // limpar deve resetar o valor exibido para 0, mas manter o operandoAnterior e o operador
      // Ex: 5 + , pressiona C -> visor vai pra 0, mas ainda estamos em "5 +" esperando o próximo.
      // No entanto, a UX comum do iOS é que C limpa a entrada atual e se torna AC.
      // A UX mais comum é que C limpa a entrada atual para 0. Se C for pressionado novamente, vira AC.
      // Se o botão é 'C' (ou seja, valorExibido não é '0' ou um operador está ativo)
      setValorExibido('0');
      // Não reseta esperandoOperando aqui, pois o usuário pode querer digitar um novo número para a operação pendente
      // Se o usuário pressionar C quando um operador está ativo (ex: 5 +), ele espera que o display volte a 0
      // e ele possa digitar um novo segundo operando.
      // Se ele pressionar C novamente, aí sim vira AC.
      // A lógica do texto do botão (C/AC) já cuida disso.
      // Se o valor exibido se tornou '0' e não há operador, o botão vira 'AC'.
    } else { // Comportamento AC ou C que limpa tudo
      setValorExibido('0');
      setOperandoAnterior(null);
      setOperadorSelecionado(null);
      setEsperandoOperando(false);
    }
  };


  const aoPressionarMaisMenos = () => {
    if (valorExibido === 'Erro') return;
    const valorNumerico = parseFloat(valorExibido);
    if (valorNumerico === 0 && valorExibido.startsWith('-')) { // Caso de "-0"
      setValorExibido('0');
    } else if (valorNumerico === 0) { // Caso de "0"
      return;
    } else {
      setValorExibido(String(valorNumerico * -1));
    }
    // setEsperandoOperando(false); // Se um número foi alterado, não estamos mais "esperando" no mesmo sentido.
  };

  const aoPressionarPorcentagem = () => {
    if (valorExibido === 'Erro') return;
    const valorNumerico = parseFloat(valorExibido);
    let resultadoPorcentagem;

    if (operandoAnterior !== null && operadorSelecionado) {
      // Calcula a porcentagem em relação ao operandoAnterior
      // Ex: 100 + 10% (de 100) = 100 + 10 = 110
      // Ex: 100 * 10% (0.1) = 10
      const porcentagemDoAnterior = (parseFloat(operandoAnterior) * valorNumerico) / 100;
      if (operadorSelecionado === '+' || operadorSelecionado === '-') {
        resultadoPorcentagem = porcentagemDoAnterior;
      } else if (operadorSelecionado === '*' || operadorSelecionado === '/') {
        resultadoPorcentagem = valorNumerico / 100; // Para multiplicação/divisão, % geralmente significa valor/100
      } else {
        resultadoPorcentagem = valorNumerico / 100;
      }
    } else {
      // Se não houver operação pendente, calcula valor/100
      resultadoPorcentagem = valorNumerico / 100;
    }
    setValorExibido(String(parseFloat(resultadoPorcentagem.toFixed(7))));
    // setEsperandoOperando(true); // Comportamento pode variar; iOS parece não mudar isso
  };


  const renderizarBotao = (texto, onPress, estiloBase, estiloTextoBase, simboloOperador = null) => {
    const ativo = simboloOperador === operadorSelecionado && esperandoOperando; // Botão de operador está ativo se corresponde ao selecionado E estamos esperando o próximo operando

    let estiloBotao = [estilos.botao, estiloBase];
    let estiloTexto = [estilos.textoBotao, estiloTextoBase];

    if (ativo) {
      // Inverte cores para feedback de operador ativo
      if (estiloBase === estilos.botaoLaranja) {
        estiloBotao.push(estilos.botaoLaranjaAtivo);
        estiloTexto.push(estilos.textoLaranjaAtivo);
      }
    }

    return (
      <TouchableOpacity
        style={estiloBotao}
        onPress={onPress}
      >
        <Text style={estiloTexto}>{texto}</Text>
      </TouchableOpacity>
    );
  };

  // Determina o texto do botão AC/C
  // Se valorExibido não é '0' E não estamos esperando um operando (ou seja, estamos no meio da digitação do primeiro ou segundo número), é 'C'
  // OU se valorExibido é '0' MAS um operador está ativo (ex: 5 + 0), também é 'C' para limpar o '0' e digitar novo segundo operando.
  // OU se valorExibido é 'Erro', é 'C'
  // Senão é 'AC'
  const textoLimpar = (valorExibido !== '0' && !esperandoOperando) || (esperandoOperando && operadorSelecionado) || valorExibido === 'Erro' ? 'C' : 'AC';


  return (
    <View style={estilos.container}>
      <View style={estilos.visorContainer}>
        <Text style={estilos.textoVisor} numberOfLines={1} ellipsizeMode="head">
          {valorExibido}
        </Text>
      </View>

      <View style={estilos.tecladoContainer}>
        <View style={estilos.linhaBotoes}>
          {renderizarBotao(textoLimpar, aoPressionarLimpar, estilos.botaoCinzaClaro, estilos.textoPreto)}
          {renderizarBotao('+/-', aoPressionarMaisMenos, estilos.botaoCinzaClaro, estilos.textoPreto)}
          {renderizarBotao('%', aoPressionarPorcentagem, estilos.botaoCinzaClaro, estilos.textoPreto)}
          {renderizarBotao('÷', () => aoPressionarOperador('/'), estilos.botaoLaranja, estilos.textoBranco, '/')}
        </View>

        <View style={estilos.linhaBotoes}>
          {renderizarBotao('7', () => aoPressionarNumero(7), estilos.botaoCinzaEscuro, estilos.textoBranco)}
          {renderizarBotao('8', () => aoPressionarNumero(8), estilos.botaoCinzaEscuro, estilos.textoBranco)}
          {renderizarBotao('9', () => aoPressionarNumero(9), estilos.botaoCinzaEscuro, estilos.textoBranco)}
          {renderizarBotao('×', () => aoPressionarOperador('*'), estilos.botaoLaranja, estilos.textoBranco, '*')}
        </View>

        <View style={estilos.linhaBotoes}>
          {renderizarBotao('4', () => aoPressionarNumero(4), estilos.botaoCinzaEscuro, estilos.textoBranco)}
          {renderizarBotao('5', () => aoPressionarNumero(5), estilos.botaoCinzaEscuro, estilos.textoBranco)}
          {renderizarBotao('6', () => aoPressionarNumero(6), estilos.botaoCinzaEscuro, estilos.textoBranco)}
          {renderizarBotao('-', () => aoPressionarOperador('-'), estilos.botaoLaranja, estilos.textoBranco, '-')}
        </View>

        <View style={estilos.linhaBotoes}>
          {renderizarBotao('1', () => aoPressionarNumero(1), estilos.botaoCinzaEscuro, estilos.textoBranco)}
          {renderizarBotao('2', () => aoPressionarNumero(2), estilos.botaoCinzaEscuro, estilos.textoBranco)}
          {renderizarBotao('3', () => aoPressionarNumero(3), estilos.botaoCinzaEscuro, estilos.textoBranco)}
          {renderizarBotao('+', () => aoPressionarOperador('+'), estilos.botaoLaranja, estilos.textoBranco, '+')}
        </View>

        <View style={estilos.linhaBotoes}>
          {renderizarBotao('0', () => aoPressionarNumero(0), [estilos.botaoCinzaEscuro, estilos.botaoZero], estilos.textoBranco)}
          {renderizarBotao('.', aoPressionarDecimal, estilos.botaoCinzaEscuro, estilos.textoBranco)}
          {renderizarBotao('=', aoPressionarIgual, estilos.botaoLaranja, estilos.textoBranco)}
        </View>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'flex-end',
  },
  visorContainer: {
    paddingHorizontal: 25,
    paddingBottom: 20,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    minHeight: 120,
  },
  textoVisor: {
    fontSize: 70,
    color: '#fff',
    fontWeight: '300',
  },
  tecladoContainer: {
    paddingBottom: 20,
  },
  linhaBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: TAMANHO_BOTAO * 0.15,
  },
  botao: {
    width: TAMANHO_BOTAO,
    height: TAMANHO_BOTAO,
    borderRadius: TAMANHO_BOTAO / 2,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  textoBotao: {
    fontSize: TAMANHO_BOTAO * 0.4,
    color: '#fff',
  },
  botaoCinzaClaro: {
    backgroundColor: '#a5a5a5',
  },
  botaoCinzaEscuro: {
    backgroundColor: '#333333',
  },
  botaoLaranja: {
    backgroundColor: '#f1a33c',
  },
  botaoLaranjaAtivo: { // Novo estilo para operador ativo
    backgroundColor: '#fff', // Fundo branco
  },
  textoLaranjaAtivo: { // Novo estilo para texto do operador ativo
    color: '#f1a33c', // Texto laranja
  },
  botaoZero: {
    width: TAMANHO_BOTAO * 2 + TAMANHO_BOTAO * 0.15, // O cálculo original da margem era TAMANHO_BOTAO * 0.15 / 2 (aproximadamente), mas como os botões têm margin: 5, podemos usar o margin diretamente.
    // Se cada botão tem margin: 5, são 2*5 = 10 de margem entre 3 botões.
    // O ideal é usar o mesmo espaçamento da justifyContent: 'space-evenly'.
    // Para simplificar, vamos manter o cálculo original que considera o espaço entre botões.
    alignItems: 'flex-start',
    paddingLeft: TAMANHO_BOTAO * 0.4,
  },
  textoPreto: {
    color: '#000',
  },
  textoBranco: {
    color: '#fff',
  },
});
