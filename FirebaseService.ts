import { initializeApp } from "firebase/app";

import { getDatabase, ref, set, get, child } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCd1ueora0NNg53nVNf5ZIby4B_6n8iS2k",
  authDomain: "cyieb-c0244.firebaseapp.com",
  databaseURL: "https://cyieb-c0244-default-rtdb.firebaseio.com",
  projectId: "cyieb-c0244",
  storageBucket: "cyieb-c0244.appspot.com",
  messagingSenderId: "627596457867",
  appId: "1:627596457867:web:0f09291c68e1547780218e"
};

export const _ = initializeApp(firebaseConfig);
const db = getDatabase();
const dbRef = ref(db);

export const saveToken = async (userId: string, token: string) => {
  const values = (await get(child(dbRef, `userTokens/${userId}/`))).val() ?? {};
  const payload = { ...values, token };
  set(ref(db, `userTokens/${userId}/`), payload);
};

export const getToken = async (userId: string) => {
  const values = (await get(child(dbRef, `userTokens/${userId}`))).val();
  return values ?? {};
};

export const getAllUsers = async () => {
  const users = (await get(child(dbRef, `Users`))).val();
  const expoTokens: String[] = [];
  Object.keys(users).forEach(key => {
      const value = users[key];
      if(value.hasOwnProperty("expoToken"))
      {
        if(expoTokens.indexOf(value.expoToken) == -1)
        {
          expoTokens.push(value.expoToken);
        }
      }
  });
  
  return expoTokens;
}

export const saveSample = async (moistureLevel: number, userId: string) => {
  set(ref(db, `users/${userId}/${Date.now().toString()}`), {
    moisture: moistureLevel,
  });
};

export const getSamples = async (userId: string) => {
  const values = (await get(child(dbRef, `users/${userId}/`))).val();
  const moistureReadings = Object.values(values) as { moisture: number }[];
  const readings = moistureReadings.map((reading) => reading.moisture);

  return {
    currentMoistureLevel: readings[readings.length - 1],
    previousMoistureLevels: readings,
  };
};
