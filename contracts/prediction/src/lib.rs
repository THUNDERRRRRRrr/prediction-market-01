#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, Vec,
};

const MARKETS: Symbol = symbol_short!("MARKETS");
const COUNT: Symbol = symbol_short!("COUNT");

#[contracttype]
#[derive(Clone)]
pub enum Outcome {
    Higher,
    Lower,
}

#[contracttype]
#[derive(Clone)]
pub struct Bet {
    pub bettor: Address,
    pub amount: i128,
    pub outcome: Outcome,
}

#[contracttype]
#[derive(Clone)]
pub struct Market {
    pub id: u32,
    pub asset: String,
    pub target_price: i128,
    pub deadline: u64,
    pub resolved: bool,
    pub winner_higher: bool,
    pub bets: Vec<Bet>,
    pub total_higher: i128,
    pub total_lower: i128,
}

#[contract]
pub struct PredictionMarket;

#[contractimpl]
impl PredictionMarket {
    pub fn create_market(env: Env, asset: String, target_price: i128, deadline: u64) -> u32 {
        let id: u32 = env.storage().instance().get(&COUNT).unwrap_or(0);

        let market = Market {
            id,
            asset,
            target_price,
            deadline,
            resolved: false,
            winner_higher: false,
            bets: Vec::new(&env),
            total_higher: 0,
            total_lower: 0,
        };

        let mut markets: Vec<Market> = env
            .storage()
            .instance()
            .get(&MARKETS)
            .unwrap_or(Vec::new(&env));

        markets.push_back(market);
        env.storage().instance().set(&MARKETS, &markets);
        env.storage().instance().set(&COUNT, &(id + 1));
        env.storage().instance().extend_ttl(100, 100);

        id
    }

    pub fn place_bet(
        env: Env,
        market_id: u32,
        bettor: Address,
        amount: i128,
        predict_higher: bool,
    ) {
        bettor.require_auth();

        let mut markets: Vec<Market> = env
            .storage()
            .instance()
            .get(&MARKETS)
            .unwrap_or(Vec::new(&env));

        let mut market = markets.get(market_id).unwrap();

        let outcome = if predict_higher {
            Outcome::Higher
        } else {
            Outcome::Lower
        };

        if predict_higher {
            market.total_higher += amount;
        } else {
            market.total_lower += amount;
        }

        let bet = Bet {
            bettor,
            amount,
            outcome,
        };
        market.bets.push_back(bet);
        markets.set(market_id, market);

        env.storage().instance().set(&MARKETS, &markets);
        env.storage().instance().extend_ttl(100, 100);
    }

    pub fn resolve_market(env: Env, market_id: u32, price_went_higher: bool) {
        let mut markets: Vec<Market> = env
            .storage()
            .instance()
            .get(&MARKETS)
            .unwrap_or(Vec::new(&env));

        let mut market = markets.get(market_id).unwrap();
        market.resolved = true;
        market.winner_higher = price_went_higher;

        markets.set(market_id, market);
        env.storage().instance().set(&MARKETS, &markets);
        env.storage().instance().extend_ttl(100, 100);
    }

    pub fn get_markets(env: Env) -> Vec<Market> {
        env.storage()
            .instance()
            .get(&MARKETS)
            .unwrap_or(Vec::new(&env))
    }

    pub fn get_market(env: Env, market_id: u32) -> Market {
        let markets: Vec<Market> = env
            .storage()
            .instance()
            .get(&MARKETS)
            .unwrap_or(Vec::new(&env));
        markets.get(market_id).unwrap()
    }

    pub fn get_count(env: Env) -> u32 {
        env.storage().instance().get(&COUNT).unwrap_or(0)
    }
}

mod test;
