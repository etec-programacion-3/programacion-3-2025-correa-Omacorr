package org.example
/**
 * Ventajas de data class en simulador basketball:
 *
 * - Inmutabilidad: Stats no cambian accidentalmente durante simulación
 * - equals() automático: Comparar jugadores con mismas habilidades (player1.skills == player2.skills)
 * - hashCode() consistente: Usar como claves en mapas para cachear resultados
 * - toString() legible: Debug fácil sin implementación manual
 * - copy(): Crear variaciones (skills.copy(velocidad = 60)) para rookies/veteranos
 * - Destructuring: Extraer valores (val (ataque, defensa, velocidad) = skills) para cálculos
 * - Sin data class necesitarías 30+ líneas manuales propensas a errores
 */
data class PlayerSkills(
    //Uso var para poder modificar sus valores luego con la función entrenar
    var tiro: Int,
    var defensa: Int,
    var velocidad: Int,
    var bloqueo: Int,
    var definicion: Int
){
    init {
        require(tiro in 50..100) { "El valor de tiro debe estar entre 50 y 100, pero se recibió: $tiro" }
        require(defensa in 50..100) { "El valor de defensa debe estar entre 50 y 100, pero se recibió: $defensa" }
        require(velocidad in 50..100) { "El valor de velocidad debe estar entre 50 y 100, pero se recibió: $velocidad" }
        require(bloqueo in 50..100) { "El valor de bloqueo debe estar entre 50 y 100, pero se recibió: $bloqueo" }
        require(definicion in 50..100) { "El valor de definición debe estar entre 50 y 100, pero se recibió: $definicion" }
    }

    override fun toString(): String {
        return "Habilidades: Tiro = $tiro | Defensa = $defensa | Velocidad = $velocidad | Bloqueo = $bloqueo | Definición = $definicion"
    }
}