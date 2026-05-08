import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, FlatList } from 'react-native';

export default function App() {
  // --- Lógica del Temporizador ---
  const [seconds, setSeconds] = useState(600); // 10 minutos por defecto
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
      }, 1000);
    } else if (seconds === 0) {
      clearInterval(interval);
      alert("¡Tiempo cumplido! Hora de un descanso.");
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  // --- Lógica de Tareas ---
  const [task, setTask] = useState('');
  const [taskList, setTaskList] = useState([]);

  const addTask = () => {
    if (task.length > 0) {
      setTaskList([...taskList, { id: Date.now().toString(), value: task }]);
      setTask('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Study App</Text>
      
      {/* Sección Temporizador */}
      <View style={styles.timerBox}>
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        <View style={styles.row}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => setIsActive(!isActive)}>
            <Text style={styles.buttonText}>{isActive ? 'Pausar' : 'Iniciar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, {backgroundColor: '#ff6b6b'}]} 
            onPress={() => {setIsActive(false); setSeconds(600);}}>
            <Text style={styles.buttonText}>Reiniciar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sección Tareas */}
      <TextInput
        style={styles.input}
        placeholder="Nueva tarea del colegio..."
        value={task}
        onChangeText={t => setTask(t)}
      />
      <TouchableOpacity style={styles.addBtn} onPress={addTask}>
        <Text style={styles.buttonText}>Agregar Tarea</Text>
      </TouchableOpacity>

      <FlatList
        data={taskList}
        renderItem={({ item }) => (
          <View style={styles.taskItem}><Text>• {item.value}</Text></View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 20, backgroundColor: '#f0f2f5' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  timerBox: { backgroundColor: '#fff', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 5 },
  timerText: { fontSize: 60, fontWeight: '200', color: '#333' },
  row: { flexDirection: 'row', marginTop: 10 },
  button: { backgroundColor: '#4a90e2', padding: 15, borderRadius: 10, marginHorizontal: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginTop: 20 },
  addBtn: { backgroundColor: '#2ecc71', padding: 15, borderRadius: 10, marginTop: 10, alignItems: 'center' },
  taskItem: { backgroundColor: '#fff', padding: 15, marginTop: 10, borderRadius: 10 }
});