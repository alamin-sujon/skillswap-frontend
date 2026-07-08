import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Button } from "react-native-paper";
import Toast from "react-native-toast-message";

const API_BASE = "http://localhost:3000";

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    university: "",
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const { fullName, email, password } = formData;

    if (!fullName || !email || !password) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password }),
      });

      const data = await response.json();
      console.log("Register Response:", data);

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Registration Successful',
          text2: 'Your account has been created successfully!',
        });
      } else {
        const errorMessage =
          data.message || data.error || "Registration failed";
        Alert.alert("Registration Failed", errorMessage);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: 'Unable to create your account. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.form}>
          <Text style={styles.title}>Join Skill Swap</Text>
          <Text style={styles.subtitle}>Start your skill journey</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name *"
            value={formData.fullName}
            onChangeText={(text) =>
              setFormData({ ...formData, fullName: text })
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Email Address *"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password *"
            value={formData.password}
            onChangeText={(text) =>
              setFormData({ ...formData, password: text })
            }
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="University (Optional)"
            value={formData.university}
            onChangeText={(text) =>
              setFormData({ ...formData, university: text })
            }
          />

          <Button
            mode="contained"
            onPress={handleRegister}
            style={styles.button}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.loadingText}>Creating Account...</Text>
              </View>
            ) : (
              "Create Account"
            )}
          </Button>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.link}>
              Already have an account?{" "}
              <Text style={styles.linkBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F8FAF9",
    justifyContent: "center",
    padding: 20,
  },
  form: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#2D6A4F",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B8F71",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0EBE5",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 15,
    backgroundColor: "#F8FAF9",
  },
  button: {
    marginTop: 10,
    borderRadius: 12,
    height: 52,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 15,
  },
  link: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 14.5,
    color: "#6B8F71",
  },
  linkBold: {
    color: "#2D6A4F",
    fontWeight: "700",
  },
});

export default RegisterScreen;
