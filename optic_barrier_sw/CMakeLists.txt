cmake_minimum_required(VERSION 3.1.0)

project(optic_barrier_sw)

message(STATUS "CMAKE_C_COMPILER: ${CMAKE_C_COMPILER}")
set(CMAKE_C_COMPILER arm-linux-gnueabihf-gcc)
message(STATUS "CMAKE_C_COMPILER: ${CMAKE_C_COMPILER}")

link_directories(${CMAKE_SOURCE_DIR} wiringPi/)

INCLUDE_DIRECTORIES("wiringPi", "OLED/Fonts", "OLED/Driver")

set(SRCS main.c OLED/Driver/OLED_Config.c OLED/Driver/OLED_Driver.c OLED/Driver/OLED_GUI.c OLED/Fonts/font8.c OLED/Fonts/font12.c OLED/Fonts/font16.c OLED/Fonts/font20.c OLED/Fonts/font24.c) 

add_executable(${PROJECT_NAME} ${HDRS} ${SRCS} )

target_link_libraries(${PROJECT_NAME} -lwiringPi)
