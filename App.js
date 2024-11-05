import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, Share, View, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const App = () => {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [sales, setSales] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState(''); // Estado para mensagem de feedback

  useEffect(() => {
    loadSales(); // Carregar vendas ao iniciar o aplicativo
  }, []);

  const loadSales = async () => {
    try {
      const storedSales = await AsyncStorage.getItem('@sales_data');
      if (storedSales) {
        setSales(JSON.parse(storedSales));
      }
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
    }
  };

  const storeSales = async (newSales) => {
    try {
      await AsyncStorage.setItem('@sales_data', JSON.stringify(newSales));
    } catch (e) {
      console.error('Erro ao armazenar dados:', e);
    }
  };

  const handleSubmit = () => {
    if (!productName || !price) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const newSale = { productName, price: parseFloat(price) };

    if (editingIndex !== null) {
      const updatedSales = sales.map((sale, index) =>
        index === editingIndex ? newSale : sale
      );
      setSales(updatedSales);
      storeSales(updatedSales); // Atualiza armazenamento
      setEditingIndex(null);
      setFeedbackMessage('Venda editada com sucesso!'); // Mensagem de feedback
    } else {
      const updatedSales = [...sales, newSale];
      setSales(updatedSales);
      storeSales(updatedSales); // Armazena nova venda
      setFeedbackMessage('Venda adicionada com sucesso!'); // Mensagem de feedback
    }

    setProductName('');
    setPrice('');

    // Oculta a mensagem após 3 segundos
    setTimeout(() => {
      setFeedbackMessage('');
    }, 3000);
  };

  const handleEditSale = (index) => {
    const saleToEdit = sales[index];
    setProductName(saleToEdit.productName);
    setPrice(saleToEdit.price.toString());
    setEditingIndex(index);
  };

  const handleRemoveSale = (index) => {
    Alert.alert(
      'Remover venda',
      'Tem certeza que deseja remover esta venda?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover', onPress: () => {
            const updatedSales = sales.filter((_, i) => i !== index);
            setSales(updatedSales);
            storeSales(updatedSales); // Atualiza armazenamento após remoção
            setFeedbackMessage('Venda removida com sucesso!'); // Mensagem de feedback

            // Oculta a mensagem após 3 segundos
            setTimeout(() => {
              setFeedbackMessage('');
            }, 3000);
          }
        },
      ]
    );
  };

  const totalSales = sales.reduce((total, sale) => total + sale.price, 0);

  const filteredSales = sales.filter(sale =>
    sale.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportSales = async () => {
    if (sales.length === 0) {
      Alert.alert('Sem Vendas', 'Não há vendas para exportar.');
      return;
    }

    const csvContent = [
      ['Produto', 'Preço'],
      ...sales.map(sale => [sale.productName, sale.price.toFixed(2)]),
    ]
      .map(e => e.join(","))
      .join("\n");

    const fileUri = `${FileSystem.documentDirectory}vendas.csv`;

    await FileSystem.writeAsStringAsync(fileUri, csvContent);
    Alert.alert('Sucesso', 'Vendas exportadas com sucesso!', [
      { text: 'Compartilhar', onPress: () => shareFile(fileUri) },
      { text: 'OK' }
    ]);
  };

  const shareFile = async (fileUri) => {
    await Share.share({
      url: fileUri,
      message: 'Aqui estão minhas vendas!',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Adicione sua logo aqui */}
      <View style={styles.logoContainer}>
        <Image source={require('./assets/jj.jpg')} style={styles.logo} />
      </View>

      <Text style={styles.title}>Controle de Vendas</Text>

      {feedbackMessage ? ( // Exibe a mensagem de feedback se houver
        <Text style={styles.feedbackMessage}>{feedbackMessage}</Text>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Nome do Produto"
        value={productName}
        onChangeText={setProductName}
      />
      <TextInput
        style={styles.input}
        placeholder="Preço"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{editingIndex !== null ? 'Editar Venda' : 'Adicionar Venda'}</Text>
      </TouchableOpacity>

      {/* Campo de busca */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar Produto"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <TouchableOpacity style={styles.exportButton} onPress={exportSales}>
        <Text style={styles.exportButtonText}>Exportar Vendas</Text>
      </TouchableOpacity>

      <Text style={styles.totalText}>{`Total de Vendas: R$${totalSales.toFixed(2)}`}</Text>

      <ScrollView style={styles.salesList}>
        {filteredSales.map((sale, index) => (
          <View key={index} style={styles.saleCard}>
            <TouchableOpacity onPress={() => handleEditSale(index)}>
              <Text style={styles.saleItem}>{`Produto: ${sale.productName}`}</Text>
              <Text style={styles.salePrice}>{`Preço: R$${sale.price.toFixed(2)}`}</Text>
              <Text style={styles.saleDate}>{`Data: ${new Date().toLocaleDateString()}`}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRemoveSale(index)}>
              <Text style={styles.removeText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start', // Mudei para flex-start para manter a logo no topo
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#eaeaea',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20, // Espaço entre a logo e o título
  },
  logo: {
    width: 100, // Ajuste o tamanho da logo
    height: 100,
    borderRadius: 50, // Torna a logo redonda
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#6200ee',
  },
  feedbackMessage: {
    color: 'green', // Cor do texto da mensagem de feedback
    fontSize: 16,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#6200ee',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    width: '100%',
    backgroundColor: '#fff',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#6200ee',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    width: '100%',
    backgroundColor: '#fff',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 10,
    borderRadius: 5,
    width: '100%',
  },
  buttonText: {
    color: '#fff', // Cor do texto do botão
    textAlign: 'center', // Centraliza o texto
    fontWeight: 'bold',
  },
  exportButton: {
    backgroundColor: '#4caf50', // Cor diferente para o botão de exportar
    padding: 10,
    borderRadius: 5,
    width: '100%',
    marginTop: 10,
  },
  exportButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#6200ee',
  },
  salesList: {
    marginTop: 20,
    width: '100%',
  },
  saleCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  saleItem: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  salePrice: {
    fontSize: 16,
    color: '#4caf50', // Cor verde para o preço
  },
  saleDate: {
    fontSize: 12,
    color: '#aaa', // Cor cinza para a data
  },
  removeText: {
    color: '#ff5722', // Cor para o texto de remoção
    textAlign: 'right',
  },
});

export default App;
