package org.example

fun main(){
    val skills = PlayerSkills(80, 87, 85, 92, 95)
    val posicion = PlayerPosition.PIVOT
    val pancho = Player(16, "Pancho", 1.95, posicion, skills)
    val checho = Player(19, "Checho", 1.80, PlayerPosition.PIVOT, PlayerSkills(80, 57, 60, 62, 70))
    val unc = Team("UNCuyo")
    println(pancho.entrenar("tiro"))
}