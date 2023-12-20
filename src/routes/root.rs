use yew::{function_component, Html, html};
use rand::{
    distributions::{Distribution, Standard},
    Rng,
}; // 0.8.0

enum Background {
    Gehenna,
    Sarum,
    Thaddis
}

static GEHENNA_PATH : &str = "images/Gehenna1024.png";
static SARUM_PATH : &str = "images/Sarum1024.png";
static THADDIS_PATH : &str = "images/Thaddis1024.png";

impl Background {
    fn get_file_name(&self) -> &str {
        match self {
            Background::Gehenna => GEHENNA_PATH,
            Background::Sarum => SARUM_PATH,
            Background::Thaddis => THADDIS_PATH,
        }
    }
}

impl Distribution<Background> for Standard {
    fn sample<R: Rng + ?Sized>(&self, rng: &mut R) -> Background {
        // match rng.gen_range(0, 3) { // rand 0.5, 0.6, 0.7
        match rng.gen_range(0..=2) { // rand 0.8
            0 => Background::Gehenna,
            1 => Background::Sarum,
            _ => Background::Thaddis,
        }
    }
}

#[function_component(Root)]
pub fn root() -> Html {
    let bg: Background = rand::random();
    html! {
        <div class="root">
            <img src={ bg.get_file_name().to_string() } />

            <p>{"This site is powered by Rust, Yew, Web Assambly and GitHub."}</p>
        </div>
    }
}