import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Calendar } from "react-native-calendars";

const moods = [
  { label: "😡 Angry", value: "Angry" },
  { label: "😤 Irritated", value: "Irritated" },
  { label: "😰 Anxious", value: "Anxious" },
  { label: "😢 Sad", value: "Sad" },
  { label: "😔 Lonely", value: "Lonely" },
  { label: "😐 Okay", value: "Okay" },
  { label: "😁 Happy", value: "Happy" },
];

const suggestions = {
  Angry: `Try breathing exercises, go for a run, listen to calm music, or practice yoga.`,
  Irritated: `Identify the root cause (e.g., stress, lack of sleep), then try deep breathing, light exercise, or relaxation.`,
  Anxious: `Exercise, get outdoors, talk to someone you trust, or engage in a productive activity.`,
  Sad: `Engage in hobbies, listen to uplifting music, journal in this app, or talk to someone. It's okay to feel and cry.`,
  Lonely: `Reach out online/offline, read a good book, indulge in your interests, or do a kind act for someone else.`,
  Okay: `Stay active, stretch, talk to someone if needed, or enjoy a quick walk or yoga session.`,
  Happy: `Savor the moment, stay hydrated, dance it out, share your joy, or reflect with gratitude. 😊`,
};

const dietSuggestions = {
  breakfast: [
    "Upma",
    "Idli",
    "Sambar",
    "Dosa",
    "Whole wheat sandwich",
    "Roti with veggies",
  ],
  lunch: ["Rice", "Dal", "Veggies", "Paneer/Tofu/Mushroom", "Legumes"],
  snacks: [
    "Roasted chickpeas",
    "Yogurt with berries",
    "Mixed nuts",
    "Sprout salad",
    "Fruit chaat",
    "Corn chaat",
  ],
  dinner: [
    "Roti with veggies",
    "Chhole (Chickpea Curry)",
    "Saag Paneer",
    "Baingan Bharta (Roasted Eggplant)",
    "Dal Makhani",
    "Bhindi Masala",
    "Scrambled Egg Curry",
  ],
};

const defaultYogaPoses = [
  "Full Surya Namaskar",
  "Child's Pose",
  "Downward-Facing Dog",
  "Tree Pose",
  "Warrior II",
  "Savasana (Corpse Pose)",
  "Powerful Pose (Utkatasana)",
  "Bridge Pose (Setu Bandhasana)",
  "Pigeon Pose (Eka Kapotasana)",
  "Seated Twist (Marichyasana)",
];

export default function App() {
  const [step, setStep] = useState(1);
  const [selectedMood, setSelectedMood] = useState("");
  const [markedDates, setMarkedDates] = useState({});
  const [viewDiary, setViewDiary] = useState(false);
  const [diaryPassword, setDiaryPassword] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [diaryDate, setDiaryDate] = useState("");
  const [diaryEntry, setDiaryEntry] = useState("");
  const [todoItem, setTodoItem] = useState("");
  const [todoList, setTodoList] = useState([]);
  const [waterIntake, setWaterIntake] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2700);
  const [viewYoga, setViewYoga] = useState(false);
  const [selectedYoga, setSelectedYoga] = useState([]);
  const [customYogaPose, setCustomYogaPose] = useState("");
  const [savedYoga, setSavedYoga] = useState([]);
  const [viewDiet, setViewDiet] = useState(false);
  const [sleepHours, setSleepHours] = useState("");
  const [viewSummary, setViewSummary] = useState(false);

  useEffect(() => {
    loadPassword();
    loadTodos();
    loadTodayWater();
    loadLatestYoga();
    loadTodaySleep();
    const today = new Date().toISOString().split("T")[0];
    setDiaryDate(today);
  }, []);

  const saveMood = async (mood) => {
    const today = new Date().toISOString().split("T")[0];
    await AsyncStorage.setItem(`mood-${today}`, mood);
    updateMarkedDate(today, mood);
    setSelectedMood(mood);
    setStep(2);
  };

  const updateMarkedDate = (date, mood) => {
    setMarkedDates((prev) => ({
      ...prev,
      [date]: {
        marked: true,
        dotColor: getColorForMood(mood),
        selected: true,
      },
    }));
  };

  const getColorForMood = (mood) => {
    switch (mood) {
      case "Happy":
        return "green";
      case "Okay":
        return "blue";
      case "Lonely":
        return "purple";
      case "Sad":
        return "navy";
      case "Anxious":
        return "orange";
      case "Irritated":
        return "brown";
      case "Angry":
        return "red";
      default:
        return "gray";
    }
  };

  const loadTodayWater = async () => {
    const today = new Date().toISOString().split("T")[0];
    const saved = await AsyncStorage.getItem(`water-${today}`);
    if (saved) setWaterIntake(parseInt(saved, 10));

    const goal = await AsyncStorage.getItem("water-goal");
    if (goal) setWaterGoal(parseInt(goal, 10));
  };

  const addWater = async () => {
    const today = new Date().toISOString().split("T")[0];
    const stored = await AsyncStorage.getItem(`water-${today}`);
    let newVal = stored ? parseInt(stored, 10) + 250 : 250;
    setWaterIntake(newVal);
    await AsyncStorage.setItem(`water-${today}`, newVal.toString());
    if (newVal >= waterGoal) {
      Alert.alert("Hydration Goal", "You’ve reached your daily goal!");
    }
  };

  const saveWaterGoal = async () => {
    await AsyncStorage.setItem("water-goal", waterGoal.toString());
    Alert.alert("Goal Saved", `Your daily goal is set to ${waterGoal} ml.`);
  };

  const savePassword = async () => {
    await AsyncStorage.setItem("diary-pass", diaryPassword);
    Alert.alert("Password Set", "Diary password saved.");
  };

  const checkPassword = async () => {
    const stored = await AsyncStorage.getItem("diary-pass");
    if (enteredPassword === stored) {
      setAuthenticated(true);
      loadDiaryEntry();
    } else {
      Alert.alert("Incorrect Password", "Try again");
    }
  };

  const saveDiaryEntry = async () => {
    await AsyncStorage.setItem(`diary-${diaryDate}`, diaryEntry);
    Alert.alert("Saved", "Diary updated for " + diaryDate);
  };

  const loadDiaryEntry = async () => {
    const entry = await AsyncStorage.getItem(`diary-${diaryDate}`);
    if (entry) setDiaryEntry(entry);
  };

  const loadPassword = async () => {
    const pwd = await AsyncStorage.getItem("diary-pass");
    if (pwd) setDiaryPassword(pwd);
  };

  const loadTodos = async () => {
    const value = await AsyncStorage.getItem("todo-list");
    if (value) setTodoList(JSON.parse(value));
  };

  const addTodo = async () => {
    if (todoItem.trim() === "") return;
    const newList = [...todoList, { text: todoItem, completed: false }];
    setTodoList(newList);
    setTodoItem("");
    await AsyncStorage.setItem("todo-list", JSON.stringify(newList));
  };

  const toggleTodo = async (index) => {
    const list = [...todoList];
    list[index].completed = !list[index].completed;
    setTodoList(list);
    await AsyncStorage.setItem("todo-list", JSON.stringify(list));
  };

  const saveYogaRoutine = async () => {
    await AsyncStorage.setItem("latest-yoga", JSON.stringify(selectedYoga));
    setSavedYoga(selectedYoga);
    setViewYoga(false);
    Alert.alert("Saved", "Your yoga routine has been saved.");
  };

  const loadLatestYoga = async () => {
    const latest = await AsyncStorage.getItem("latest-yoga");
    if (latest) setSavedYoga(JSON.parse(latest));
  };

  const saveTodaySleep = async () => {
    const today = new Date().toISOString().split("T")[0];
    await AsyncStorage.setItem(`sleep-${today}`, sleepHours);
    Alert.alert("Saved", "Today's sleep logged.");
  };

  const loadTodaySleep = async () => {
    const today = new Date().toISOString().split("T")[0];
    const stored = await AsyncStorage.getItem(`sleep-${today}`);
    if (stored) setSleepHours(stored);
  };

  const viewMonthlySummary = async () => {
    let sleepTotals = [];
    let moodsList = [];
    let waterTotal = 0;

    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");

    for (let i = 1; i <= 31; i++) {
      const day = i < 10 ? `0${i}` : `${i}`;
      const date = `${year}-${month}-${day}`;

      const sleep = await AsyncStorage.getItem(`sleep-${date}`);
      if (sleep) sleepTotals.push(Number(sleep));

      const mood = await AsyncStorage.getItem(`mood-${date}`);
      if (mood) moodsList.push({ date, mood });

      const water = await AsyncStorage.getItem(`water-${date}`);
      if (water) waterTotal += parseInt(water);
    }

    const avgSleep =
      sleepTotals.length > 0
        ? (sleepTotals.reduce((a, b) => a + b, 0) / sleepTotals.length).toFixed(
            1
          )
        : "N/A";

    Alert.alert(
      "Monthly Summary",
      `Average Sleep: ${avgSleep} hrs\nTotal Water Intake: ${waterTotal} ml\nYoga Poses: ${
        savedYoga.join(", ") || "None"
      }\nLogged moods: ${moodsList.length}`
    );
  };

  const renderMoodSelection = () => (
    <View style={styles.section}>
      <Text style={styles.title}>How are you feeling today?</Text>
      {moods.map((mood) => (
        <TouchableOpacity
          key={mood.value}
          style={styles.moodButton}
          onPress={() => saveMood(mood.value)}
        >
          <Text style={styles.moodText}>{mood.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSuggestion = () => (
    <View style={styles.section}>
      <Text style={styles.title}>Suggestion for you</Text>
      <Text style={styles.suggestion}>{suggestions[selectedMood]}</Text>
      <Button title="Continue to Tracker" onPress={() => setStep(3)} />
    </View>
  );

  const renderDiaryPage = () => {
    if (!authenticated) {
      return (
        <View style={styles.section}>
          <TextInput
            style={styles.input}
            placeholder="Enter Diary Password"
            secureTextEntry
            value={enteredPassword}
            onChangeText={setEnteredPassword}
          />
          <Button title="Unlock Diary" onPress={checkPassword} />
        </View>
      );
    }
    return (
      <ScrollView style={styles.whitePage}>
        <Text style={styles.title}>Diary for {diaryDate}</Text>
        <TextInput
          style={[styles.input, { minHeight: 150 }]}
          multiline
          placeholder="Type your thoughts..."
          value={diaryEntry}
          onChangeText={setDiaryEntry}
        />
        <Button title="Save Diary" onPress={saveDiaryEntry} />
        <Button title="Back" onPress={() => setViewDiary(false)} />
      </ScrollView>
    );
  };

  const renderYogaPage = () => (
    <ScrollView style={styles.whitePage}>
      <Text style={styles.title}>Select Yoga Poses</Text>
      {defaultYogaPoses.map((pose, i) => (
        <TouchableOpacity
          key={i}
          style={{
            padding: 10,
            backgroundColor: selectedYoga.includes(pose) ? "#cceeff" : "#eee",
            marginVertical: 5,
            borderRadius: 5,
          }}
          onPress={() => {
            if (selectedYoga.includes(pose)) {
              setSelectedYoga(selectedYoga.filter((p) => p !== pose));
            } else {
              setSelectedYoga([...selectedYoga, pose]);
            }
          }}
        >
          <Text>{pose}</Text>
        </TouchableOpacity>
      ))}
      <TextInput
        style={styles.input}
        placeholder="Add custom pose..."
        value={customYogaPose}
        onChangeText={setCustomYogaPose}
      />
      <Button
        title="Add Custom Pose"
        onPress={() => {
          if (customYogaPose.trim() !== "") {
            setSelectedYoga([...selectedYoga, customYogaPose]);
            setCustomYogaPose("");
          }
        }}
      />
      <Button title="Save Routine" onPress={saveYogaRoutine} />
      <Button title="Back" onPress={() => setViewYoga(false)} />
    </ScrollView>
  );

  const renderDietPage = () => (
    <ScrollView style={styles.whitePage}>
      <Text style={styles.title}>Balanced Diet Suggestions</Text>
      {Object.entries(dietSuggestions).map(([meal, items]) => (
        <View key={meal}>
          <Text style={styles.subheading}>
            {meal.charAt(0).toUpperCase() + meal.slice(1)}
          </Text>
          {items.map((item, i) => (
            <Text key={`${meal}-${i}`}>• {item}</Text>
          ))}
        </View>
      ))}
      <Button title="Back" onPress={() => setViewDiet(false)} />
    </ScrollView>
  );

  const renderTracker = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mood Calendar</Text>
      <Calendar markedDates={markedDates} />

      <Text style={styles.title}>Daily Routine</Text>

      <View style={styles.checklistRow}>
        <Button title="+250ml Water" onPress={addWater} />
        <Text>
          {waterIntake} ml / {waterGoal} ml
        </Text>
      </View>

      <View style={styles.checklistRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Hours Slept Today"
          keyboardType="numeric"
          value={sleepHours}
          onChangeText={setSleepHours}
        />
        <Button title="Save Sleep" onPress={saveTodaySleep} />
      </View>

      <Button title="Set Yoga Routine" onPress={() => setViewYoga(true)} />

      {savedYoga.length > 0 && (
        <View style={{ marginTop: 15 }}>
          <Text style={styles.subheading}>Your Latest Yoga Routine:</Text>
          {savedYoga.map((pose, i) => (
            <Text key={i}>• {pose}</Text>
          ))}
        </View>
      )}

      <Text style={styles.title}>To-Do List</Text>
      <TextInput
        style={styles.input}
        placeholder="Add Task"
        value={todoItem}
        onChangeText={setTodoItem}
      />
      <Button title="Add" onPress={addTodo} />
      {todoList.map((item, index) => (
        <TouchableOpacity key={index} onPress={() => toggleTodo(index)}>
          <Text
            style={{
              textDecorationLine: item.completed ? "line-through" : "none",
              fontSize: 16,
            }}
          >
            • {item.text}
          </Text>
        </TouchableOpacity>
      ))}

      <Button title="Write Diary" onPress={() => setViewDiary(true)} />
      <Button
        title="Balanced Diet Suggestions"
        onPress={() => setViewDiet(true)}
      />
      <Button title="View Monthly Summary" onPress={viewMonthlySummary} />

      <TextInput
        style={styles.input}
        placeholder="Set Diary Password (Optional)"
        value={diaryPassword}
        onChangeText={setDiaryPassword}
        secureTextEntry
      />
      <Button title="Save Password" onPress={savePassword} />
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {step === 1 && renderMoodSelection()}
      {step === 2 && renderSuggestion()}
      {step === 3 &&
        (viewDiary
          ? renderDiaryPage()
          : viewYoga
          ? renderYogaPage()
          : viewDiet
          ? renderDietPage()
          : renderTracker())}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
  whitePage: { flex: 1, backgroundColor: "white", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  subheading: { fontSize: 18, fontWeight: "600", marginTop: 10 },
  section: { marginBottom: 20 },
  moodButton: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    alignItems: "center",
  },
  moodText: { fontSize: 18 },
  suggestion: {
    fontSize: 16,
    fontStyle: "italic",
    marginVertical: 10,
    color: "#444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  checklistRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
});

