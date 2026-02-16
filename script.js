const API_KEY = "YOUR_API_KEY_HERE"; //please replace with your personal api key.
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const movieContainer = document.getElementById("movie-container");
const genreSelect = document.getElementById("genre-select");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
let lastMovies = [];
let lastView = "home";

//genre ids for TMDB
const GENRE_IDS = {
    action: 28,
    adventure: 12,
    animation: 16,
    comedy: 35,
    crime: 80,
    documentary: 99,
    drama: 18,
    family: 10751,
    fantasy: 14,
    history: 36,
    horror: 27,
    music: 10402,
    mystery: 9648,
    romance: 10749,
    "sci-fi": 878,
    "tv-movie": 10770,
    thriller: 53,
    war: 10752,
    western: 37
};

//fetch movies
async function fetchMovies(endpoint){
    movieContainer.innerHTML = "<p>Loading...</p>";
    try{
        const response = await fetch(endpoint);
        const data = await response.json();
        if(!data.results || data.results.length === 0){
            movieContainer.innerHTML = "<p>No movies found.</p>";
            return;
        }
        displayMovies(data.results.slice(0, 12));
    } catch (error){
        console.error(error);
        movieContainer.innerHTML = "<p>Error finding movies. Sorry lmao.</p>";
    }
}

//display movie posters
function displayMovies(movies){
    lastMovies = movies;
    movieContainer.innerHTML = "";
    movies.slice(0, 20).forEach((movie) => {
        const posterDiv = document.createElement("div");
        posterDiv.classList.add("movie-card");
        const posterImage = movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : "images/placeholder.png";
        posterDiv.innerHTML = `
            <img src = "${posterImage}" alt = "${movie.title}">
                <h3>${movie.title}</h3>
                <p>${movie.release_date ? movie.release_date.slice(0, 4) : "N/A"}</p>
                `;
        posterDiv.addEventListener("click", () => fetchMovieDetails(movie.id));
        movieContainer.appendChild(posterDiv);
        });
}

//---fetch single movie fetchMovieDetails---
async function fetchMovieDetails(id) {
    try{
        const response = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`);
        const movie = await response.json();
        const poster = movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : "images/placeholder.png";
    movieContainer.innerHTML = `
  <div class="movie-detail-wrapper">
    <div class="movie-details">
      <div class="poster-container">
        <img src="${poster}" alt="${movie.title}" />
      </div>
      <div class="movie-info">
        <h2>${movie.title}</h2>
        <p><strong>Release Date:</strong> ${movie.release_date}</p>
        <p><strong>Genre:</strong> ${movie.genres.map((g) => g.name).join(", ")}</p>
        <p><strong>Rating:</strong> ${movie.vote_average}/10</p>
        <p><strong>Overview:</strong> ${movie.overview}</p>
      </div>
    </div>
    <div class="back-button-container">
      <button id="back-button">Back to results</button>
    </div>
  </div>
`;
    document.getElementById("back-button").addEventListener("click", () => {
        if(lastMovies.length > 0){
            displayMovies(lastMovies);
        } else if(lastView === "search" && searchInput.value.trim()){
            searchMovies(searchInput.value.trim());
        } else if(lastView === "genre" && genreSelect.value){
            genreMovies(genreSelect.value);
        } else{
            const endpoint = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
            fetchMovies(endpoint);
        }
    });
 } catch (error){
    console.error(error);
    movieContainer.innerHTML = "<p>Failed to load movie details</p>";
    }
}

//search form
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if(query) searchMovies(query);
});

//search movies by title
function searchMovies(query){
    lastView = "search";
    const endpoint = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;
    fetchMovies(endpoint);
}

//genre select filter
genreSelect.addEventListener("change", () => {
    const genre = genreSelect.value;
    genreMovies(genre);
});

function genreMovies(genre){
    lastView = "genre";
    const genreId = GENRE_IDS[genre];
    const endpoint = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`;
    fetchMovies(endpoint);
}

//opening screen with popular movies
window.addEventListener("load", () => {
    const endpoint = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
    fetchMovies(endpoint);
});