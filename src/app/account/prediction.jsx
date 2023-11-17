'use client'
import { createClient } from '@supabase/supabase-js'
import React, { useState, useEffect } from 'react'
import sha256 from 'js-sha256';
import dotenv from 'dotenv';
dotenv.config({ path: '../../../.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function Prediction() {

  const crypto = require('crypto');
  const [prediction, setPrediction] = useState('')
  const [salt, setSalt] = useState('')
  const [hash, setHash] = useState('')
  const [final, setFinal] = useState('')

  let twitterId = "dummyTwitterID"
  

  function generateSalt() {
    return crypto.randomBytes(8).toString('hex');
  }

    const updateHash = () => {
        const combination = "Prediction: " + prediction + "\nTwitter ID: " + twitterId + "\nSalt: " + salt
        const newHash = sha256(combination);
        setHash(newHash)
        setFinal(combination)
        console.log("final: ", combination, "hash: ", newHash)
    }

    useEffect(() => {
        // TODO: get the Twitter ID from auth state
        setSalt(generateSalt())
      }, []);

    useEffect(() => {
        if (prediction === "") setHash("")
        else updateHash()
      }, [prediction, salt]);


    const handlePredictionChange = (e) => {
        setPrediction(e.target.value)
    };

    const updateDb = async () => {
      try {
        const { data, error } = await supabase
          .from('predictions')
          .insert([
            {
              sender: 'c8b2919b-80c7-45b0-aef0-29f7ca99097e',
              prediction_txt: final,
              prediction_hash: hash
            }
          ])
          .select();
    
        console.log("error: ", error);
    
        if (error) {
          console.error('Error:', error.message);
        } else {
          console.log('Data:', data);
        }
      } catch (error) {
        alert('Error loading user data!');
        console.error('Unexpected error:', error);
      }
    };
    
      
  return (
    <>
    <div>
        <label htmlFor="prediction">New Prediction</label>
        <input
        type="text"
        onChange={(e) => handlePredictionChange(e)}
        placeholder="Enter prediction, max 300 chars"
      />
    </div>
    <div>
        <label htmlFor="id">Twitter ID</label>
        <input
        type="text"
        value={twitterId} disabled
        />
    </div>
    <div>
        <label htmlFor="salt">Salt</label>
        <input
        id="salt"
        type="text"
        value={salt}
        readOnly
        />
        <button onClick={() => setSalt(generateSalt())}>Regenerate</button>
    </div>
    <div>
        <label htmlFor="hash">Hash</label>
        <input
        id="hash"
        type="text"
        value = {hash}
        readOnly
        />
    </div>
    <button
        onClick={() => updateDb()}
        >Create</button>
    </>
  )
}