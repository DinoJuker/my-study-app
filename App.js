import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Clock, Calendar as CalendarIcon, RotateCcw, Plus, X, ChevronUp, ChevronDown } from 'lucide-react-native';

const FRASES = [
  "El éxito es la suma de pequeños esfuerzos.",
  "No cuentes los días, haz que los días cuenten.",
  "Tu único rival es la persona que fuiste ayer.",
  "La disciplina tarde o temprano vencerá a la inteligencia.",
  "Hazlo ahora. A veces 'después' se convierte en 'nunca'.",
  "Cree en ti y estarás a medio camino."
];

export default function App() {
  const [view, setView] = useState('timer'); 
  const [seconds, setSeconds] = useState(600);
  const [initialSeconds, setInitialSeconds] = useState(600);
  const [isActive, setIsActive] = useState(false);
  const [frase, setFrase] = useState(FRASES[0]);
  
  // Estados de la Agenda
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [taskText, setTaskText] = useState('');
  const [priority, setPriority] = useState('Azul'); 
  const [savedTasks, setSavedTasks] = useState({}); 

  // Fondo Dinámico
  const getDynamicBackground = () => {
    if (!isActive) return '#F5F9FF';
    const progress = seconds / initialSeconds;
    return progress > 0.5 ? '#FFF5F5' : '#E8F0FE'; 
  };

  useEffect(() => {
    let interval = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds(s => s - 1), 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      alert("¡Récord batido! Sesión completada.");
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const toggleTimer = () => {
    if (!isActive) {
      const nuevaFrase = FRASES[Math.floor(Math.random() * FRASES.length)];
      setFrase(nuevaFrase);
      setInitialSeconds(seconds);
    }
    setIsActive(!isActive);
  };

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const adjustTime = (amount) => {
    const newSeconds = seconds + amount;
    if (newSeconds >= 600 && newSeconds <= 18000) {
      setSeconds(newSeconds);
      setInitialSeconds(newSeconds);
    }
  };

  const saveTask = () => {
    if (taskText && selectedDate) {
      setSavedTasks(prev => ({
        ...prev,
        [selectedDate]: [...(prev[selectedDate] || []), { text: taskText, type: priority }]
      }));
      setTaskText('');
      setModalVisible(false);
    }
  };

  const getPriorityColor = (type) => {
    if (type === 'Rojo') return '#FF4B4B';
    if (type === 'Amarillo') return '#FFD700';
    return '#4A90E2';
  };

  const tomorrowTasks = (() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const str = tomorrow.toISOString().split('T')[0];
    return savedTasks[str] || [];
  })();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getDynamicBackground() }]}>
      {view === 'timer' ? (
        <View style={styles.content}>
          <View style={styles.fraseContainer}>
            <Text style={styles.fraseText}>"{frase}"</Text>
          </View>

          {tomorrowTasks.length > 0 && (
            <View style={styles.alertBox}>
              <Text style={styles.alertTitle}>🔔 MAÑANA:</Text>
              {tomorrowTasks.map((t, i) => (
                <Text key={i} style={[styles.alertText, {color: getPriorityColor(t.type)}]}>• {t.text}</Text>
              ))}
            </View>
          )}

          <View style={styles.timerContainer}>
            {!isActive && <TouchableOpacity onPress={() => adjustTime(60)}><ChevronUp color="#4A90E2" size={40}/></TouchableOpacity>}
            <Text style={styles.timerText}>{formatTime(seconds)}</Text>
            {!isActive && <TouchableOpacity onPress={() => adjustTime(-60)}><ChevronDown color="#4A90E2" size={40}/></TouchableOpacity>}
          </View>
          
          {!isActive && (
            <View style={styles.pomodoroRow}>
              <TouchableOpacity style={styles.pomoBtn} onPress={() => {setSeconds(1500); setInitialSeconds(1500);}}>
                <Text style={styles.pomoBtnText}>🍅 25m</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pomoBtn} onPress={() => {setSeconds(300); setInitialSeconds(300);}}>
                <Text style={styles.pomoBtnText}>☕ 5m</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.controls}>
            <TouchableOpacity style={[styles.mainBtn, { backgroundColor: isActive ? '#FF6B6B' : '#4A90E2' }]} onPress={toggleTimer}>
              <Text style={styles.btnText}>{isActive ? 'PAUSAR' : 'INICIAR'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetBtn} onPress={() => {setIsActive(false); setSeconds(600); setInitialSeconds(600);}}>
              <RotateCcw color="#666" size={28} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={{flex: 1}}>
          <ScrollView style={styles.calendarView}>
            <Text style={styles.sectionTitle}>Agenda Mensual</Text>
            <Calendar 
              onDayPress={day => setSelectedDate(day.dateString)}
              markedDates={{...Object.keys(savedTasks).reduce((acc, d) => ({...acc, [d]: {marked: true}}), {}), [selectedDate]: {selected: true, selectedColor: '#4A90E2'}}}
            />
            
            <Text style={styles.subTitle}>Lista de Tareas:</Text>
            {Object.keys(savedTasks).sort().map(date => (
              <View key={date} style={styles.dateGroup}>
                <Text style={styles.dateText}>{date}</Text>
                {savedTasks[date].map((t, i) => (
                  <View key={i} style={[styles.taskCard, {borderLeftColor: getPriorityColor(t.type)}]}>
                    <Text>• {t.text}</Text>
                  </View>
                ))}
              </View>
            ))}
            <View style={{height: 120}} />
          </ScrollView>
          
          {selectedDate !== '' && (
            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
              <Plus color="#FFF" size={30} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
              <Text style={{fontWeight:'bold'}}>Tarea para: {selectedDate}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X size={24}/></TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="¿Qué hay que hacer?" value={taskText} onChangeText={setTaskText}/>
            <Text style={{fontSize: 12, marginBottom: 10, color: '#666'}}>Prioridad:</Text>
            <View style={styles.priorityRow}>
              {['Rojo', 'Amarillo', 'Azul'].map(p => (
                <TouchableOpacity key={p} style={[styles.prioOption, {backgroundColor: getPriorityColor(p), borderWidth: priority === p ? 2 : 0, borderColor: '#333'}]} onPress={() => setPriority(p)}>
                  <Text style={{color: '#FFF', fontSize: 10, fontWeight: 'bold'}}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={saveTask}>
              <Text style={{color:'#FFF', fontWeight:'bold'}}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => setView('timer')} style={styles.tabItem}>
          <Clock color={view === 'timer' ? '#4A90E2' : '#999'} size={24}/>
          <Text style={{color: view === 'timer' ? '#4A90E2' : '#999', fontSize: 11}}>Foco</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setView('calendar')} style={styles.tabItem}>
          <CalendarIcon color={view === 'calendar' ? '#4A90E2' : '#999'} size={24}/>
          <Text style={{color: view === 'calendar' ? '#4A90E2' : '#999', fontSize: 11}}>Agenda</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  fraseContainer: { height: 60, justifyContent: 'center', marginBottom: 20 },
  fraseText: { fontSize: 16, fontStyle: 'italic', color: '#555', textAlign: 'center' },
  timerText: { fontSize: 80, fontWeight: '200', color: '#333' },
  timerContainer: { alignItems: 'center' },
  pomodoroRow: { flexDirection: 'row', gap: 15, marginVertical: 20 },
  pomoBtn: { backgroundColor: '#FFF', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#DDD' },
  pomoBtnText: { fontSize: 15, fontWeight: 'bold' },
  alertBox: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, width: '100%', marginBottom: 20, elevation: 3 },
  alertTitle: { fontWeight: 'bold', fontSize: 11, color: '#555' },
  alertText: { fontWeight: 'bold' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  mainBtn: { paddingVertical: 18, paddingHorizontal: 50, borderRadius: 35 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  resetBtn: { padding: 15, backgroundColor: '#FFF', borderRadius: 50, borderWidth: 1, borderColor: '#EEE' },
  calendarView: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 20 },
  subTitle: { fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  taskCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 8, borderLeftWidth: 6 },
  dateGroup: { marginBottom: 15 },
  dateText: { fontWeight: 'bold', color: '#4A90E2' },
  fab: { position: 'absolute', right: 25, bottom: 110, width: 65, height: 65, borderRadius: 35, backgroundColor: '#4A90E2', alignItems: 'center', justifyContent: 'center', elevation: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', padding: 30, borderRadius: 25 },
  input: { borderBottomWidth: 1, borderColor: '#DDD', marginBottom: 20, fontSize: 18, padding: 5 },
  priorityRow: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  prioOption: { padding: 10, borderRadius: 8, flex: 1, alignItems: 'center' },
  saveBtn: { padding: 16, backgroundColor: '#4A90E2', borderRadius: 12, alignItems: 'center' },
  tabBar: { height: 85, flexDirection: 'row', backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE' },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});