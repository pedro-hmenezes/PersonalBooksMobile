import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, StatusBar, Keyboard, Alert } from 'react-native';
import axios from 'axios';

// CONFIGURAÇÃO DA API
// IMPORTANTE!!! Para rodar no celular físico ou emulador
// substitua "SEU_IP_AQUI" pelo endereço IPv4 da sua máquina (ex: 192.168.0.15)
// Se estiver usando emulador Android Studio, pode tentar "10.0.2.2"
const API_URL = 'http://192.168.1.12:3000/livros'; 

export default function App() {
  const [livros, setLivros] = useState([]);
  
  // Estados do Formulário
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [ano, setAno] = useState('');
  const [status, setStatus] = useState('');
  
  // Estado para controlar se estamos editando (guarda o ID do livro sendo editado)
  const [idEditando, setIdEditando] = useState(null);

  // CARREGAR DADOS AO ABRIR O APP (READ)
  useEffect(() => {
    listarLivros();
  }, []);

  const listarLivros = async () => {
    try {
      const response = await axios.get(API_URL);
      setLivros(response.data);
    } catch (error) {
      console.error("Erro ao listar:", error);
      Alert.alert("Erro", "Não foi possível carregar os livros. Verifique o IP.");
    }
  };

  // FUNÇÃO PRINCIPAL (DECIDE SE CRIA OU ATUALIZA)
  const handleSalvar = async () => {
    if (!titulo || !autor) {
      Alert.alert("Atenção", "Preencha pelo menos Título e Autor.");
      return;
    }

    try {
      // Se idEditando tem valor, e uma ATUALIZAÇÃO (PUT)
      if (idEditando) {
        await axios.put(`${API_URL}/${idEditando}`, {
          titulo, autor, ano, status
        });
        Alert.alert("Sucesso", "Livro atualizado!");
      } 
      // Se idEditando é null, é um CADASTRO NOVO (POST)
      else {
        await axios.post(API_URL, {
          titulo, autor, ano, status
        });
        Alert.alert("Sucesso", "Livro cadastrado!");
      }

      // Limpa tudo e recarrega a lista
      limparFormulario();
      listarLivros();
      Keyboard.dismiss();

    } catch (error) {
      console.error("Erro ao salvar:", error);
      Alert.alert("Erro", "Falha ao salvar o livro");
    }
  };

  // PREPARAR PARA EDITAR
  const editarLivro = (livro) => {
    setTitulo(livro.titulo);
    setAutor(livro.autor);
    setAno(String(livro.ano));
    setStatus(livro.status);
    setIdEditando(livro.id); 
  };

  // DELETAR (DELETE)
  const deletarLivro = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      Alert.alert("Sucesso", "Livro removido!");
      listarLivros();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      Alert.alert("Erro", "Falha ao deletar.");
    }
  };

  // Função para limpar os campos
  const limparFormulario = () => {
    setTitulo('');
    setAutor('');
    setAno('');
    setStatus('');
    setIdEditando(null);
  };

  // RENDERIZAR DA LISTA
  const renderLivro = ({ item }) => (
    <View style={styles.cardLivro}>
      <View style={styles.livroInfo}>
        <Text style={styles.livroTitulo}>{item.titulo}</Text>
        <Text style={styles.livroDetalhe}>{item.autor} - {item.ano}</Text>
        <Text style={styles.livroStatus}>Status: {item.status}</Text>
      </View>
      <View style={styles.livroBotoes}>
        <TouchableOpacity style={styles.botaoEditar} onPress={() => editarLivro(item)}>
          <Text style={styles.textoBotao}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoDeletar} onPress={() => deletarLivro(item.id)}>
          <Text style={styles.textoBotao}>X</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <Text style={styles.header}>📚 Meus Livros</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Título do Livro"
          placeholderTextColor="#999"
          value={titulo}
          onChangeText={setTitulo}
        />
        <TextInput
          style={styles.input}
          placeholder="Autor"
          placeholderTextColor="#999"
          value={autor}
          onChangeText={setAutor}
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 10 }]}
            placeholder="Ano"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={ano}
            onChangeText={setAno}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Status (Lido/Lendo)"
            placeholderTextColor="#999"
            value={status}
            onChangeText={setStatus}
          />
        </View>

        <TouchableOpacity 
          style={[styles.botaoSalvar, idEditando ? styles.botaoAtualizar : {}]} 
          onPress={handleSalvar}
        >
          <Text style={styles.textoBotaoSalvar}>
            {idEditando ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR LIVRO'}
          </Text>
        </TouchableOpacity>

        {idEditando && (
          <TouchableOpacity style={styles.botaoCancelar} onPress={limparFormulario}>
            <Text style={styles.textoBotaoCancelar}>Cancelar Edição</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.subtitulo}>Lista de Leitura</Text>
      
      <FlatList
        data={livros}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderLivro}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={<Text style={styles.textoVazio}>Carregando ou nenhum livro...</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#2c2c2c',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#3a3a3a',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botaoSalvar: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  botaoAtualizar: {
    backgroundColor: '#FFA500',
  },
  botaoCancelar: {
    marginTop: 10,
    alignItems: 'center',
  },
  textoBotaoSalvar: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  textoBotaoCancelar: {
    color: '#FF5252',
  },
  subtitulo: {
    fontSize: 20,
    color: '#ddd',
    marginBottom: 10,
    fontWeight: '600',
  },
  lista: {
    paddingBottom: 20,
  },
  cardLivro: {
    backgroundColor: '#2c2c2c',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  livroInfo: {
    flex: 1,
  },
  livroTitulo: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  livroDetalhe: {
    color: '#aaa',
    fontSize: 14,
  },
  livroStatus: {
    color: '#4CAF50',
    fontSize: 12,
    marginTop: 2,
    fontWeight: 'bold',
  },
  livroBotoes: {
    flexDirection: 'row',
  },
  botaoEditar: {
    backgroundColor: '#FFA500',
    padding: 8,
    borderRadius: 5,
    marginRight: 5,
  },
  botaoDeletar: {
    backgroundColor: '#FF5252',
    padding: 8,
    borderRadius: 5,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  textoVazio: {
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  }
});