const apiButton = document.getElementById('apiButton');
const pokemonContainer = document.getElementById('pokemonContainer');

const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');

// 1. Capturamos el selector de tipo que ya tienes en tu HTML
const typeFilter = document.getElementById('typeFilter');

const counterDisplay = document.getElementById('counterDisplay');

const pokemonSearchInput = document.getElementById('pokemonSearchInput');
const searchButton = document.getElementById('searchButton');

let offset = 0; //punto de inicio
const limit = 50; // Cantidad por pagina

const performSearch = async () => {
    const query = pokemonSearchInput.value.toLowerCase().trim(); // Pasamos a minúscula

    if(!query) return;

    pokemonContainer.innerHTML = 'Buscando...';
    counterDisplay.innerText = '';

    try 
    {
        // 1. Intentamos buscar por coincidencia exacta (ID o Nombre completo)
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        
        if (res.ok) {
            const info = await res.json();
            renderSingleCard(info); // Función auxiliar para no repetir código

            //verificamos si la consulta era un numero o texto
            const isNumber = !isNaN(query);
            const textoBusqueda = isNumber ? `ID: ${query}` : `el nombre: "${query.toUpperCase()}"`;
            
            // Personalizamos el mensaje
            counterDisplay.innerText = `Mostrando resultado para Pokemón con ${textoBusqueda}`;
            counterDisplay.style.cssText = "text-align: center; display: block; margin: 20px auto; color: white; font-weight: bold;";

        } else {
            // Pedimos una lista grande para filtrar
            const listRes = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=500`);
            const listData = await listRes.json();

            // Filtramos los nombres que contienen lo que el usuario escribió
            const matches = listData.results.filter(p => p.name.includes(query));


            if (matches.length > 0) {
                pokemonContainer.innerHTML = ''; // Limpiamos el "Buscando..."
                // Traemos el detalle de los primeros (máximo 5 para no saturar)
                for (let i = 0; i < Math.min(matches.length, 100); i++) {
                    const detailRes = await fetch(matches[i].url);
                    const detailInfo = await detailRes.json();
                    renderSingleCard(detailInfo, true); // true para que sume y no borre
                }
                counterDisplay.innerText = `Se encontraron ${matches.length} coincidencias para "${query}"`;
                counterDisplay.style.cssText = "text-align: center; display: block; margin: 20px auto; color: white;";
            } else {
                pokemonContainer.innerHTML = `<p style="color:white; text-align:center; ">No se encontró nada con "${query}"</p>`;
            }
        }
        } catch (e) 
        {
            console.error("Error en búsqueda:", e);
        }
};

// Función auxiliar para dibujar la card (para no repetir código)
const renderSingleCard = (info, append = false) => 
    {
        const tiposTexto = info.types.map(t => t.type.name).join(', ').toUpperCase();
        const card = `
            <div class="pokemon-card">
                <img src="${info.sprites.front_default}" alt="${info.name}">
                <p><strong>ID: </strong>${info.id}</p>
                <p><strong>NOMBRE: </strong>${info.name.toUpperCase()}</p>
                <p><strong>TIPO: </strong>${tiposTexto}</p>
                <p><strong>EXP: </strong>${info.base_experience}</p>
            </div>
        `;
        if (append) {
            pokemonContainer.innerHTML += card;
        } else {
            pokemonContainer.innerHTML = card;
        }
        
};



const searchPokemonById = async () => {
    const id = pokemonSearchInput.value;

    //validamos que el usuario  haya escrito algo
    if(!id){
        alert("Por favor, ingresa un ID válido.");
        return;
    }
    pokemonContainer.innerHTML = 'Buscando Pokemon';
    counterDisplay.innerText = '';

    try
    {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);

        if(!res.ok) throw new Error("Pokemon no encontrado");

        const info = await res.json();
        const tiposLista = info.types.map(t => t.type.name);
        const tiposTexto = tiposLista.join(', ').toUpperCase();

        // Creamos la card del Pokémon único
        const card = `
            <div class="pokemon-card">
                <img src="${info.sprites.front_default}" alt="${info.name}">
                <p><strong>ID: </strong>${info.id}</p>
                <p><strong>NOMBRE: </strong>${info.name.toUpperCase()}</p>
                <p><strong>TIPO: </strong>${tiposTexto}</p>
                <p><strong>EXP: </strong>${info.base_experience}</p>
            </div>
        `;

        pokemonContainer.innerHTML = card;
        counterDisplay.innerText = `Mostrando resultado para el ID: ${id}`;
    }
    catch (e) {
        pokemonContainer.innerHTML = `<p style="color:white;">Error: No se encontró ningún Pokémon con el ID ${id}</p>`;
        console.error(e);
    }
}

//LLAMAR A LA API
const callAPI = async () => {
    let url;
    const filtro = typeFilter.value;
    url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
    
    try
    {
        const res = await fetch(url);
        const data = await res.json();

        pokemonContainer.innerHTML = 'Cargando... ';

        let htmlContent = ''; //acá guardamos las cards
        let count = 0; //variable para saber cuantos contamos

        //Recorremos la lista de pokemones
        for(const pokemon of data.results){
            const detailRes = await fetch(pokemon.url);
            const info = await detailRes.json();

            // 1. Obtenemos la lista de tipos en minúsculas (así es como vienen de la API)
            const tiposLista = info.types.map(t => t.type.name);
            // 2. Capturamos el valor del filtro
            const filtroSeleccionado = typeFilter.value; 

            // 3. LA CORRECCIÓN: Buscamos si el tipo seleccionado está en la lista de tipos del Pokémon
            // Usamos .includes() directamente sobre el array, es mucho más preciso que usarlo sobre un texto largo
            if (filtroSeleccionado !== 'all' && !tiposLista.includes(filtroSeleccionado)) {
                continue; 
            }

            count++; //si pasó el filtro, lo contamos

            // Para mostrar en la card, creamos el texto bonito DESPUÉS de filtrar
            const tiposTexto = tiposLista.join(', ').toUpperCase();

            //Creamos un "molde" para el pokemon
            const card = `
                <div class = "pokemon-card">
                    <img src = "${info.sprites.front_default}" alt = "${info.name}">
                    <p><strong>ID: </strong>${info.id}</p>
                    <p><strong>NOMBRE: </strong>${info.name.toUpperCase()}</p>
                    <p><strong>TIPO: </strong>${tiposTexto}</p>
                    <p><strong>EXP: </strong>${info.base_experience}</p>
                </div>
            `;

            htmlContent += card;           
        }
        // MOSTRAR RESULTADOS: Solo después de que el bucle terminó de trabajar
        pokemonContainer.innerHTML = htmlContent || '<p style="color:white;">No hay Pokémon de este tipo en esta página.</p>';

            //ACTUALIZACION DEL CONTADOR
            const nombreFiltro = typeFilter.options[typeFilter.selectedIndex].text;
            counterDisplay.innerText = `Mostrando ${count} de los ${limit} Pokemon (Filtro: ${nombreFiltro})`;
            // Estilos para centrarlo perfectamente
            counterDisplay.style.textAlign = "center";
            counterDisplay.style.display = "block"; // Asegura que ocupe todo el ancho para centrarse
            counterDisplay.style.margin = "20px auto";
            counterDisplay.style.color = "white";
            counterDisplay.style.color = "white"; // Para asegurar que se vea sobre el fondo
            //Bloqueamos el boton "Anterior" si estamos en la primera pagina
            prevButton.disabled = offset === 0;
    }
    catch (e)
    {
        console.error("Error: ", e);
    }

}



// --- EVENTOS (FUERA DE LA FUNCIÓN) ---

    apiButton.addEventListener('click', callAPI);

    //Eventos para los botones
    nextButton.addEventListener('click', ()=>{
        offset += limit; //avanzamos 20
        callAPI();
    });

    prevButton.addEventListener('click', ()=>{
        if(offset > 0) {
            offset -= limit; //retrocedemos 20
            callAPI();
        }
    });

//IMPORTANTE: Que se actualice la lista apenas el usuario cambie el filtro
typeFilter.addEventListener('change', () => {
    // Cuando filtramos, es mejor volver a la página 1 (offset 0)
    offset = 0;
    callAPI();
});

searchButton.addEventListener('click', performSearch);

// Extra: Buscar al presionar "Enter" sin hacer clic
pokemonSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});



// La ejecutamos una vez al cargar la página
logAllTypes();


/*

const apiButton = document.getElementById('apiButton');
const apiData = document.getElementById('apiData');
const base_experience = document.getElementById('base_experience');

const idPokemon = document.getElementById('idPokemon');
const nombrePokemon = document.getElementById('nombrePokemon');

const fotoPokemon = document.getElementById('fotoPokemon');

const callAPI = ()=> {
    fetch('https://pokeapi.co/api/v2/pokemon/ditto')
    
    .then(res => res.json())
    .then(data =>{
        console.log(data)
        //apiData.innerText = JSON.stringify(data, null, 2);

        idPokemon.innerText = `ID: ${JSON.stringify(data.id)}`
        nombrePokemon.innerText = `Nombre: ${JSON.stringify(data.name)}`
        base_experience.innerText = `Experiencia base: ${JSON.stringify(data.base_experience)}`

        // Insertamos la URL en el atributo src de la imagen
        fotoPokemon.src = data.sprites.front_default;
    })
    .catch(e => console.error(new Error (e)));
}

apiButton.addEventListener('click', callAPI);






Parámetro	    Nombre	    ¿Para qué sirve?

data	        Value	    El objeto original que recibiste de la API (el "Lego" armado).

null	        Replacer	Es un filtro. Si quisieras que solo se vieran ciertas propiedades 
                            (ej. solo el nombre), pondrías una lista aquí. 
                            Al poner null, le dices: "No filtres nada, muéstrame todo".
2	            Space	    Es el nivel de sangría (indentación). Indica cuántos espacios de "aire" debe poner 
                            antes de cada línea.

                            
// Función rápida para ver todos los tipos en consola
const logAllTypes = async () => {
    try {
        const res = await fetch('https://pokeapi.co/api/v2/type');
        const data = await res.json();
        const nombresDeTipos = data.results.map(t => t.name);
        
        console.log("--- LISTA DE TIPOS DISPONIBLES ---");
        console.log(nombresDeTipos);
        console.log("----------------------------------");
    } catch (e) {
        console.error("No se pudieron cargar los tipos:", e);
    }
};

*/