package org.example
// Creo la clase Player con varias variables de tipo val como parámetros,
// y entre ellas se encuentran la enum class PlayerPosition y la data class PlayerSkills,
// demostrando composición donde Player "tiene-una" posición y "tiene-unas" habilidades
class Player(
    val edad : Int,
    val nombre : String,
    val altura : Double,
    val posicion : PlayerPosition,
    val habilidades : PlayerSkills
) {
    override fun toString(): String {
        return "Jugador: Nombre = $nombre | Edad = $edad | Altura = $altura | Posición = $posicion\n${habilidades.toString()}"
    }
}