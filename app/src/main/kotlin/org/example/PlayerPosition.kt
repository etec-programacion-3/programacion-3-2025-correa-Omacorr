package org.example

import org.example.PlayerPosition
// Una enum class es mas eficiente porque solo te deja seleccionar los valores que esta tiene asignada
enum class PlayerPosition(val posicion : Int){
    BASE(1),
    ESCOLTA(2),
    ALERO(3),
    ALA_PIVOT(4),
    PIVOT(5)
}