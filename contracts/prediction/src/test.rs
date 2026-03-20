#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(PredictionMarket, ());
    let client = PredictionMarketClient::new(&env, &contract_id);

    let bettor1 = Address::generate(&env);
    let bettor2 = Address::generate(&env);

    // Create a BTC price market
    let id = client.create_market(
        &String::from_str(&env, "BTC"),
        &5000000i128, // $50,000 target
        &1000u64,
    );

    assert_eq!(id, 0);

    // Place bets
    client.place_bet(&0u32, &bettor1, &100_0000000i128, &true); // Higher
    client.place_bet(&0u32, &bettor2, &50_0000000i128, &false); // Lower

    let market = client.get_market(&0u32);
    assert_eq!(market.total_higher, 100_0000000i128);
    assert_eq!(market.total_lower, 50_0000000i128);

    // Resolve — price went higher
    client.resolve_market(&0u32, &true);

    let resolved = client.get_market(&0u32);
    assert_eq!(resolved.resolved, true);
}
