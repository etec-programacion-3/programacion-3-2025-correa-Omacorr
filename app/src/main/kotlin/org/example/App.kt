package org.example

fun main(){
    val skills = PlayerSkills(80, 87, 85, 92, 95)
    val posicion = PlayerPosition.PIVOT
    val pancho = Player(16, "Pancho", 1.95, posicion, skills)
    print(pancho.toString())
}