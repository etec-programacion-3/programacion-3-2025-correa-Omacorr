package org.example

class Team(val name: String) {
    // Colección privada de jugadores
    private val jugadores: MutableList<Player> = mutableListOf()

    // Versión de solo lectura expuesta públicamente
    val plantilla: List<Player>
        get() = jugadores.toList()

    // plsmtills solo se puede modificar por medio de la private var jugadores
    fun seleccJugador(jugador: Player) {
        if (jugadores.size < 5) {
            jugadores.add(jugador)
            println("${jugador.nombre} fichado correctamente para $name")
        } else {
            println("No se puede seleccionar más jugadores. Límite de 5 jugadores alcanzado para ${name}")
        }
    }

    override fun toString(): String {
        return "$plantilla"
    }
}