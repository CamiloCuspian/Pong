// Variables para las posiciones de las raquetas
let raquetaJugadorY, raquetaComputadoraY;
let anchoRaqueta = 10, altoRaqueta = 100;

// Variables para la pelota
let pelotaX, pelotaY, velocidadPelotaX = 5, velocidadPelotaY = 3;
let diametroPelota = 20;

// Variables para el puntaje
let puntajeJugador = 0, puntajeComputadora = 0;

// Variables para el control del jugador
let velocidadRaquetaJugador = 5;
let velocidadRaquetaComputadora = 3; // Velocidad de la raqueta de la computadora
let moviendoArriba = false;
let moviendoAbajo = false;

// Variables para los marcos
let grosorMarco = 10;

// Variables para las imágenes
let fondo, bola, barra1, barra2;

// Variables para los sonidos
let sonidoRaqueta, sonidoGol;

// Variable para el ángulo de rotación de la pelota
let anguloPelota = 0;

function preload() {
  // Carga las imágenes
  fondo = loadImage('fondo1.png'); 
  bola = loadImage('bola.png');    
  barra1 = loadImage('barra1.png');  
  barra2 = loadImage('barra2.png');  
  
  // Carga los sonidos
  sonidoRaqueta = loadSound('raqueta.wav');  
  sonidoGol = loadSound('fin.wav');  
}

// Configuración del lienzo
function setup() {
  createCanvas(800, 400);
  
  // Posiciones iniciales de las raquetas
  raquetaJugadorY = height / 2 - altoRaqueta / 2;
  raquetaComputadoraY = height / 2 - altoRaqueta / 2;
  
  // Posición inicial de la pelota
  pelotaX = width / 2;
  pelotaY = height / 2;
}

// Dibujo del juego en cada frame
function draw() {
  image(fondo, 0, 0, width, height);  // Dibuja la imagen de fondo
  
  // Dibujar marcos
  fill(0, 0, 255);  // Color azul para los marcos
  rect(0, 0, width, grosorMarco); // Marco superior
  rect(0, height - grosorMarco, width, grosorMarco); // Marco inferior
  
  // Dibuja las raquetas con imágenes
  image(barra1, 30, raquetaJugadorY, anchoRaqueta, altoRaqueta);  // Primera raqueta
  image(barra2, width - 40, raquetaComputadoraY, anchoRaqueta, altoRaqueta);  // Segunda raqueta
  
  // Calcula la rotación en función de la velocidad de la pelota
  anguloPelota += (sqrt(velocidadPelotaX ** 2 + velocidadPelotaY ** 2) * 0.05);

  // Guardar el estado actual de la transformación
  push();
  
  // Mover el origen al centro de la pelota para rotar
  translate(pelotaX, pelotaY);
  
  // Rotar la pelota
  rotate(anguloPelota);
  
  // Dibuja la pelota con imagen
  imageMode(CENTER); // Usar el centro para dibujar
  image(bola, 0, 0, diametroPelota, diametroPelota);
  
  // Restaurar el estado anterior de la transformación
  pop();
  
  // Movimiento de la pelota
  pelotaX += velocidadPelotaX;
  pelotaY += velocidadPelotaY;
  
  // Rebote de la pelota en los marcos superior e inferior
  if (pelotaY - diametroPelota / 2 < grosorMarco || pelotaY + diametroPelota / 2 > height - grosorMarco) {
    velocidadPelotaY *= -1;
  }

  // Lógica de colisión con las raquetas
  if (pelotaX < 40 && pelotaY > raquetaJugadorY && pelotaY < raquetaJugadorY + altoRaqueta) {
    ajustarAnguloRaqueta(raquetaJugadorY);  // Ajustar el ángulo al colisionar con la raqueta del jugador
    velocidadPelotaX *= -1;
    if (sonidoRaqueta.isLoaded()) {
      sonidoRaqueta.play(); // Reproduce sonido al colisionar con la raqueta del jugador
    }
  }

  if (pelotaX > width - 40 && pelotaY > raquetaComputadoraY && pelotaY < raquetaComputadoraY + altoRaqueta) {
    ajustarAnguloRaqueta(raquetaComputadoraY);  // Ajustar el ángulo al colisionar con la raqueta de la computadora
    velocidadPelotaX *= -1;
    if (sonidoRaqueta.isLoaded()) {
      sonidoRaqueta.play(); // Reproduce sonido al colisionar con la raqueta de la computadora
    }
  }
  
  // Reiniciar la pelota si sale de la pantalla
  if (pelotaX < 0) {
    puntajeComputadora++;
    if (sonidoGol.isLoaded()) {
      sonidoGol.play(); // Reproduce sonido al marcar un gol
    }
    narrarMarcador(); // Llama a la función de narración
    reiniciarPelota();
  }
  if (pelotaX > width) {
    puntajeJugador++;
    if (sonidoGol.isLoaded()) {
      sonidoGol.play(); // Reproduce sonido al marcar un gol
    }
    narrarMarcador(); // Llama a la función de narración
    reiniciarPelota();
  }
  
  // Movimiento de la raqueta del jugador (control con teclas)
  moverRaquetaJugador();
  
  // Movimiento de la raqueta de la computadora (seguimiento de la pelota)
  if (pelotaY > raquetaComputadoraY + altoRaqueta / 2) {
    raquetaComputadoraY += velocidadRaquetaComputadora; // Mueve hacia abajo
  } else {
    raquetaComputadoraY -= velocidadRaquetaComputadora; // Mueve hacia arriba
  }
  
  // Limita la raqueta de la computadora a los límites del canvas
  raquetaComputadoraY = constrain(raquetaComputadoraY, grosorMarco, height - altoRaqueta - grosorMarco);
  
  // Mostrar el puntaje
  mostrarPuntaje();
}

// Función para ajustar el ángulo de la pelota en función del punto de impacto
function ajustarAnguloRaqueta(raquetaY) {
  // Determina la posición relativa del impacto en la raqueta (valor entre -1 y 1)
  let puntoImpacto = (pelotaY - (raquetaY + altoRaqueta / 2)) / (altoRaqueta / 2);
  
  // Ajusta la velocidad vertical de la pelota usando un ángulo en función del impacto
  let anguloMax = radians(45);  // Máximo ángulo de desviación
  let nuevoAngulo = puntoImpacto * anguloMax;
  
  // Calcula las nuevas velocidades de la pelota
  let velocidad = sqrt(velocidadPelotaX ** 2 + velocidadPelotaY ** 2);
  velocidadPelotaY = velocidad * sin(nuevoAngulo);
  velocidadPelotaX = velocidad * cos(nuevoAngulo) * (velocidadPelotaX > 0 ? 1 : -1);  // Mantén la dirección horizontal
}

// Función para mover la raqueta del jugador con teclas
function moverRaquetaJugador() {
  if (moviendoArriba) {
    raquetaJugadorY -= velocidadRaquetaJugador;
  }
  if (moviendoAbajo) {
    raquetaJugadorY += velocidadRaquetaJugador;
  }
  raquetaJugadorY = constrain(raquetaJugadorY, grosorMarco, height - altoRaqueta - grosorMarco);
}

// Reiniciar la posición de la pelota
function reiniciarPelota() {
  pelotaX = width / 2;
  pelotaY = height / 2;
  velocidadPelotaX *= -1; // Cambiar la dirección de la pelota
}

// Mostrar el puntaje
function mostrarPuntaje() {
  textSize(32);
  fill(255);
  text(puntajeJugador, width / 4, 50);
  text(puntajeComputadora, 3 * width / 4, 50);
}

// Detectar cuándo se presionan las teclas
function keyPressed() {
  if (keyCode === UP_ARROW) {
    moviendoArriba = true;
  }
  if (keyCode === DOWN_ARROW) {
    moviendoAbajo = true;
  }
}

// Detectar cuándo se sueltan las teclas
function keyReleased() {
  if (keyCode === UP_ARROW) {
    moviendoArriba = false;
  }
  if (keyCode === DOWN_ARROW) {
    moviendoAbajo = false;
  }
}

// Función de narración del marcador utilizando la API de voz
function narrarMarcador() {
  let narrador = new SpeechSynthesisUtterance();
  narrador.text = `El marcador es, Jugador ${puntajeJugador}, Computadora ${puntajeComputadora}`;
  narrador.lang = 'es-ES'; // Idioma español
  window.speechSynthesis.speak(narrador);
}
