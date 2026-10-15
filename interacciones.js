(() => {
  "use strict";


  const contenedor = document.querySelector("#personaje .animacion-lottie");
  if (!contenedor || !window.lottie) {
    console.error("No se pudo iniciar Lottie: revisa el contenedor y la librería.");
    return;
  }


  // Reproduce únicamente los primeros 13 segundos (0–390 fotogramas a 30 fps), en loop.
  const personaje = window.lottie.loadAnimation({
    container: contenedor,
    renderer: "svg",
    loop: true,
    autoplay: false,
    path: "imagenes/Personaje_Lottie.json",
    rendererSettings: {
      preserveAspectRatio: "xMidYMid meet",
      progressiveLoad: true
    }
  });


  personaje.addEventListener("DOMLoaded", () => {
    personaje.playSegments([0, 390], true);
  });
})();




(() => {
  "use strict";


  const textoVisible = document.querySelector("#texto-presentacion");
  const textoOriginal = document.querySelector("#texto-original");


  if (!textoVisible || !textoOriginal || !window.gsap || !window.SplitText) {
    console.warn("No se pudo iniciar Popcorn Pop.");
    return;
  }


  gsap.registerPlugin(SplitText);


  // Recuperar el texto completo del cuadro.
  textoVisible.textContent = textoOriginal.textContent.trim();


  // Separar el texto en caracteres individuales.
  const separacion = SplitText.create(textoVisible, {
    type: "chars",
    charsClass: "letra-popcorn",
    aria: "auto"
  });


  // Evitar que las letras se corten durante el movimiento.
  gsap.set(separacion.chars, {
    display: "inline-block",
    transformOrigin: "50% 100%"
  });


  // Efecto Popcorn Pop: cada letra aparece desde abajo,
  // crece y gira ligeramente en un orden aleatorio.
  gsap.from(separacion.chars, {
    scale: 0,
    y: 30,
    rotation: () => gsap.utils.random(-20, 20),
    opacity: 0,
    stagger: {
      each: 0.04,
      from: "start"
    },
    duration: 0.4,
    ease: "back.out(2)",
    delay: 0.5
  });

  
})();



(() => {
  "use strict";

  // PLAYLIST LOCAL
  const playlist = [
    { src: "musica/B-Meowsic.mp3", title: "B-Meowsic .☘︎ ݁˖" },
    { src: "musica/Chat au Chocolat.mp3", title: "Chat au Chocolat ˖᯽ ݁˖" },
    { src: "musica/Waterfront Booossa.mp3", title: "Waterfront Booossa ⋆˚꩜｡" }
  ];

  const audio = new Audio();
  audio.preload = "auto";

  const anterior = document.getElementById("musica-anterior");
  const siguiente = document.getElementById("musica-siguiente");
  const botonPlay = document.getElementById("musica-play");
  const barraVolumen = document.getElementById("musica-volumen");
  const titulo = document.getElementById("musica-cancion");
  const estado = document.getElementById("musica-estado");

  const iconoPlay = botonPlay?.querySelector(".icono-play");
  const iconoPausa = botonPlay?.querySelector(".icono-pausa");

  if (
    !anterior || !siguiente || !botonPlay ||
    !barraVolumen || !titulo || !estado ||
    !iconoPlay || !iconoPausa
  ) {
    console.error("Reproductor: faltan elementos en el HTML.");
    return;
  }

  if (playlist.length === 0) {
    estado.textContent = "No hay canciones configuradas.";
    botonPlay.disabled = true;
    anterior.disabled = true;
    siguiente.disabled = true;
    return;
  }

  let indice = 0;
  let operacion = 0;
  let cambiandoCancion = false;

  // ICONOS
  function actualizarIcono(reproduciendo) {
    iconoPlay.hidden = reproduciendo;
    iconoPausa.hidden = !reproduciendo;

    botonPlay.setAttribute(
      "aria-label",
      reproduciendo ? "Pausar" : "Reproducir"
    );

    botonPlay.title = reproduciendo ? "Pausar" : "Reproducir";
  }

  // CARGAR PISTA
  function cargarCancion(nuevoIndice) {
    indice = (nuevoIndice + playlist.length) % playlist.length;
    operacion++;
    cambiandoCancion = true;

    audio.pause();
    audio.src = playlist[indice].src;
    audio.load();

    titulo.textContent = playlist[indice].title;
    actualizarIcono(false);
    estado.textContent = "Preparando canción...";

    cambiandoCancion = false;
  }

  // REPRODUCIR
  async function reproducir() {
    const idOperacion = ++operacion;

    try {
      await audio.play();

      // No aceptar respuestas de solicitudes antiguas.
      if (idOperacion !== operacion) return;

      actualizarIcono(true);
      estado.textContent = "Reproduciendo";
    } catch (error) {
      if (idOperacion !== operacion) return;

      actualizarIcono(false);

      if (error.name === "NotAllowedError") {
        estado.textContent = "Pulsa Play para iniciar la música";
      } else {
        estado.textContent = "No se pudo reproducir esta canción";
        console.error(
          "Error al reproducir:",
          playlist[indice].src,
          error
        );
      }
    }
  }

  // PAUSAR
  function pausar() {
    operacion++;
    audio.pause();
    actualizarIcono(false);
    estado.textContent = "Pausado";
  }

  // CAMBIAR DE PISTA Y REPRODUCIR
  function cambiarCancion(direccion) {
    cargarCancion(indice + direccion);
    reproducir();
  }

  // BOTÓN CENTRAL
  botonPlay.addEventListener("click", () => {
    if (audio.paused) {
      reproducir();
    } else {
      pausar();
    }
  });

  // ANTERIOR
  anterior.addEventListener("click", () => {
    cambiarCancion(-1);
  });

  // SIGUIENTE
  siguiente.addEventListener("click", () => {
    cambiarCancion(1);
  });

  // VOLUMEN
  function actualizarVolumen() {
    audio.volume = Math.max(
      0,
      Math.min(1, Number(barraVolumen.value) / 100)
    );
  }

  barraVolumen.addEventListener("input", actualizarVolumen);

  // ESTADO REAL DEL AUDIO
  audio.addEventListener("playing", () => {
    actualizarIcono(true);
    estado.textContent = "Reproduciendo";
  });

  audio.addEventListener("pause", () => {
    actualizarIcono(false);

    if (!cambiandoCancion && !audio.ended) {
      estado.textContent = "Pausado";
    }
  });

  // AL TERMINAR, PASAR A LA SIGUIENTE CANCIÓN
  audio.addEventListener("ended", () => {
    cambiarCancion(1);
  });

  // ERROR DE CARGA
  audio.addEventListener("error", () => {
    actualizarIcono(false);
    estado.textContent = "Error al cargar el archivo de audio";

    console.error(
      "No se pudo cargar:",
      playlist[indice].src,
      audio.error
    );
  });

  // INICIALIZACIÓN
  audio.volume = Number(barraVolumen.value) / 100;
  cargarCancion(0);

  // Intento de reproducción automática.
  // Si el navegador la bloquea, el usuario podrá pulsar Play.
  reproducir();
})();
