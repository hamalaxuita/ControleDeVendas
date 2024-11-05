import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const SalesScreen = () => {
  const [product, setProduct] = useState(''); // Estado para o nome do produto
  const [amount, setAmount] = useState(0);    // Estado para a quantidade

  const handleSale = () => {
    console.log(`Produto: ${product}, Quantidade: ${amount}`);
    // Adicione lógica aqui para manipular a venda, como enviar para um servidor
    setProduct(''); // Limpar o campo de produto
    setAmount(0);   // Limpar o campo de quantidade
  };

  return (
    <View style={styles.container}> {/* Aplicando o estilo ao View */}
      <Text>Registro de Vendas</Text>
      <TextInput
        placeholder="Produto"
        value={product}
        onChangeText={setProduct}
        style={styles.input} // Aplicando o estilo ao TextInput
      />
      <TextInput
        placeholder="Quantidade"
        value={amount.toString()}
        onChangeText={(text) => setAmount(Number(text))}
        keyboardType="numeric"
        style={styles.input} // Aplicando o estilo ao TextInput
      />
      <TouchableOpacity style={styles.button} onPress={handleSale}>
        <Text style={styles.buttonText}>Registrar Venda</Text>
      </TouchableOpacity>
    </View>
  );
};

// Estilos para SalesScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    width: '100%',
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 10,
    borderRadius: 5,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
});

export default SalesScreen;
