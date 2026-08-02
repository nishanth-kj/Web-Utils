use wasm_bindgen::prelude::*;
use rand::Rng;
use rand::seq::SliceRandom;

#[wasm_bindgen]
pub struct StrengthResult {
    entropy: f64,
    time_to_crack_seconds: f64,
    time_string: String,
    warnings: String,
}

#[wasm_bindgen]
impl StrengthResult {
    #[wasm_bindgen(getter)]
    pub fn entropy(&self) -> f64 {
        self.entropy
    }
    #[wasm_bindgen(getter)]
    pub fn time_string(&self) -> String {
        self.time_string.clone()
    }
    #[wasm_bindgen(getter)]
    pub fn time_to_crack_seconds(&self) -> f64 {
        self.time_to_crack_seconds
    }
    #[wasm_bindgen(getter)]
    pub fn warnings(&self) -> String {
        self.warnings.clone()
    }
}

#[wasm_bindgen]
pub fn generate_password(length: usize, use_upper: bool, use_lower: bool, use_numbers: bool, use_symbols: bool) -> String {
    let mut chars: Vec<char> = Vec::new();
    let upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let lower = "abcdefghijklmnopqrstuvwxyz";
    let numbers = "0123456789";
    let symbols = "!@#$%^&*()-_=+[]{}|;:',.<>?/";

    if use_upper { chars.extend(upper.chars()); }
    if use_lower { chars.extend(lower.chars()); }
    if use_numbers { chars.extend(numbers.chars()); }
    if use_symbols { chars.extend(symbols.chars()); }

    if chars.is_empty() {
        return String::from("");
    }

    let mut rng = rand::thread_rng();
    let mut password = String::with_capacity(length);
    for _ in 0..length {
        password.push(*chars.choose(&mut rng).unwrap());
    }
    password
}

#[wasm_bindgen]
pub fn generate_passphrase(words_str: &str, num_words: usize, separator: &str) -> String {
    let words: Vec<&str> = words_str.lines().map(|w| w.trim()).filter(|w| !w.is_empty()).collect();
    if words.is_empty() {
        return String::from("");
    }
    
    let mut rng = rand::thread_rng();
    let mut phrase = Vec::with_capacity(num_words);
    for _ in 0..num_words {
        phrase.push(*words.choose(&mut rng).unwrap());
    }
    phrase.join(separator)
}

#[wasm_bindgen]
pub fn check_password_strength(password: &str, hashes_per_second: f64) -> StrengthResult {
    let length = password.chars().count();
    let mut pool_size = 0;
    if password.chars().any(|c| c.is_ascii_lowercase()) { pool_size += 26; }
    if password.chars().any(|c| c.is_ascii_uppercase()) { pool_size += 26; }
    if password.chars().any(|c| c.is_ascii_digit()) { pool_size += 10; }
    if password.chars().any(|c| !c.is_ascii_alphanumeric()) { pool_size += 32; }
    
    if pool_size == 0 {
        return StrengthResult { entropy: 0.0, time_to_crack_seconds: 0.0, time_string: "0 seconds".to_string(), warnings: String::new() };
    }

    let mut entropy = (length as f64) * (pool_size as f64).log2();
    let mut warnings = Vec::new();

    // Advanced analysis: Deduct entropy for patterns
    let chars: Vec<char> = password.chars().collect();
    let mut repeated_count = 0;
    let mut sequential_count = 0;

    for i in 1..chars.len() {
        let curr = chars[i] as i32;
        let prev = chars[i - 1] as i32;
        
        if curr == prev {
            repeated_count += 1;
        } else if (curr - prev).abs() == 1 {
            sequential_count += 1;
        }
    }

    if repeated_count > 2 {
        entropy *= 0.7; // Deduct 30% for high repetition
        warnings.push("High number of repeated characters detected.");
    }
    if sequential_count > 2 {
        entropy *= 0.8; // Deduct 20% for sequences like 1234 or abcd
        warnings.push("Sequential characters detected (e.g. 1234, abcd).");
    }
    if length < 8 {
        warnings.push("Password is too short. Aim for at least 12 characters.");
    }

    let combinations = 2.0_f64.powf(entropy);
    let seconds = combinations / hashes_per_second;

    let time_string = format_time(seconds);

    StrengthResult {
        entropy,
        time_to_crack_seconds: seconds,
        time_string,
        warnings: warnings.join("|"),
    }
}

fn format_time(seconds: f64) -> String {
    if seconds < 1.0 { return "Instantly".to_string(); }
    if seconds < 60.0 { return format!("{:.0} seconds", seconds); }
    let minutes = seconds / 60.0;
    if minutes < 60.0 { return format!("{:.0} minutes", minutes); }
    let hours = minutes / 60.0;
    if hours < 24.0 { return format!("{:.0} hours", hours); }
    let days = hours / 24.0;
    if days < 365.0 { return format!("{:.0} days", days); }
    let years = days / 365.0;
    if years < 100.0 { return format!("{:.0} years", years); }
    if years < 1000.0 { return format!("{:.0} centuries", years / 100.0); }
    "Millions of years".to_string()
}

#[wasm_bindgen]
pub fn check_if_leaked(password: &str, file_content: &str) -> bool {
    file_content.lines().any(|line| line.trim_end() == password)
}

use md5::Md5;
use sha1::Sha1;
use sha2::{Sha224, Sha256, Sha384, Sha512};
use sha3::{Sha3_224, Sha3_256, Sha3_384, Sha3_512};
use ripemd::Ripemd160;
use digest::Digest;

#[wasm_bindgen]
pub fn compute_hash(algo: &str, text: &str) -> String {
    match algo {
        "MD5" => hex::encode(Md5::digest(text.as_bytes())),
        "SHA-1" => hex::encode(Sha1::digest(text.as_bytes())),
        "SHA-224" => hex::encode(Sha224::digest(text.as_bytes())),
        "SHA-256" => hex::encode(Sha256::digest(text.as_bytes())),
        "SHA-384" => hex::encode(Sha384::digest(text.as_bytes())),
        "SHA-512" => hex::encode(Sha512::digest(text.as_bytes())),
        "SHA3-224" => hex::encode(Sha3_224::digest(text.as_bytes())),
        "SHA3-256" => hex::encode(Sha3_256::digest(text.as_bytes())),
        "SHA3-384" => hex::encode(Sha3_384::digest(text.as_bytes())),
        "SHA3-512" => hex::encode(Sha3_512::digest(text.as_bytes())),
        "RIPEMD-160" => hex::encode(Ripemd160::digest(text.as_bytes())),
        "BLAKE3" => blake3::hash(text.as_bytes()).to_hex().to_string(),
        _ => String::new(),
    }
}

fn index_to_password(mut idx: u64, charset: &[char]) -> String {
    let base = charset.len() as u64;
    let mut length = 1;
    let mut max_for_length = base;

    while idx >= max_for_length {
        idx -= max_for_length;
        length += 1;
        max_for_length = max_for_length.checked_mul(base).unwrap_or(u64::MAX); 
    }

    let mut result = String::with_capacity(length);
    for _ in 0..length {
        let remainder = (idx % base) as usize;
        result.push(charset[remainder]);
        idx /= base;
    }
    
    result.chars().rev().collect()
}

#[wasm_bindgen]
pub struct BruteForceResult {
    pub found: bool,
    password: String,
    pub checked: u32,
}

#[wasm_bindgen]
impl BruteForceResult {
    #[wasm_bindgen(getter)]
    pub fn password(&self) -> String {
        self.password.clone()
    }
}

#[wasm_bindgen]
pub fn brute_force_batch(target_hash_hex: &str, algorithm: &str, charset_str: &str, start_idx: u64, batch_size: u32) -> BruteForceResult {
    let target = hex::decode(target_hash_hex).unwrap_or_default();
    let charset: Vec<char> = charset_str.chars().collect();
    
    for i in 0..batch_size {
        let idx = start_idx + i as u64;
        let attempt = index_to_password(idx, &charset);
        
        let hash_bytes: Vec<u8> = match algorithm {
            "MD5" => Md5::digest(attempt.as_bytes()).to_vec(),
            "SHA-1" => Sha1::digest(attempt.as_bytes()).to_vec(),
            "SHA-224" => Sha224::digest(attempt.as_bytes()).to_vec(),
            "SHA-256" => Sha256::digest(attempt.as_bytes()).to_vec(),
            "SHA-384" => Sha384::digest(attempt.as_bytes()).to_vec(),
            "SHA-512" => Sha512::digest(attempt.as_bytes()).to_vec(),
            "SHA3-224" => Sha3_224::digest(attempt.as_bytes()).to_vec(),
            "SHA3-256" => Sha3_256::digest(attempt.as_bytes()).to_vec(),
            "SHA3-384" => Sha3_384::digest(attempt.as_bytes()).to_vec(),
            "SHA3-512" => Sha3_512::digest(attempt.as_bytes()).to_vec(),
            "RIPEMD-160" => Ripemd160::digest(attempt.as_bytes()).to_vec(),
            "BLAKE3" => blake3::hash(attempt.as_bytes()).as_bytes().to_vec(),
            _ => Vec::new(),
        };

        if hash_bytes == target {
            return BruteForceResult {
                found: true,
                password: attempt,
                checked: i + 1,
            };
        }
    }
    
    BruteForceResult {
        found: false,
        password: String::new(),
        checked: batch_size,
    }
}
