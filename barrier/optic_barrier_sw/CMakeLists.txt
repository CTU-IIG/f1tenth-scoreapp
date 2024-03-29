cmake_minimum_required(VERSION 3.1.0)

project(optic_barrier_sw)

# Git versioning
set(PRE_CONFIGURE_FILE "git.h.in")
set(POST_CONFIGURE_FILE "git.h")

# Check whether we have git
execute_process(
    COMMAND git --version
    RESULT_VARIABLE GIT_CHECK
)

if("${GIT_CHECK}" EQUAL 0)
    set(GIT_AVAILABLE true)
else()
    set(GIT_AVAILABLE false)
endif()

# Preset variables
set(GIT_IS_DIRTY false)

if(GIT_AVAILABLE)
    # Git describe
    execute_process(
        COMMAND git describe --always --tags
        OUTPUT_VARIABLE GIT_DESCRIBE
        OUTPUT_STRIP_TRAILING_WHITESPACE
    )

    # Commit hash
    execute_process(
        COMMAND git log -1 --format=%h
        OUTPUT_VARIABLE GIT_COMMIT_HASH
        OUTPUT_STRIP_TRAILING_WHITESPACE
    )

    # Dirty
    execute_process(
        COMMAND git status --porcelain -uno
        OUTPUT_VARIABLE GIT_DIRTY
        OUTPUT_STRIP_TRAILING_WHITESPACE
    )

    if ("${GIT_DIRTY}" STREQUAL "")
        set(GIT_IS_DIRTY false)
    else()
        set(GIT_IS_DIRTY true)
    endif()

    # Branch name
    execute_process(
        COMMAND git rev-parse --abbrev-ref HEAD
        OUTPUT_VARIABLE GIT_BRANCH_NAME
        OUTPUT_STRIP_TRAILING_WHITESPACE
    )
endif()

get_filename_component(PRE_CONFIGURE_FILE "${PRE_CONFIGURE_FILE}" ABSOLUTE)
get_filename_component(POST_CONFIGURE_FILE "${POST_CONFIGURE_FILE}" ABSOLUTE)

configure_file("${PRE_CONFIGURE_FILE}" "${POST_CONFIGURE_FILE}" @ONLY)

# If you want to use different compiler than arm-linux-gnueabihf-gcc, run cmake as:
# cmake -DHARDCODE_C_COMPILER=NO -DCMAKE_C_COMPILER=...
set(HARDCODE_C_COMPILER YES CACHE BOOL "Override user's (or default) value of CMAKE_C_COMPILER with 'arm-linux-gnueabihf-gcc'")

if(HARDCODE_C_COMPILER)
  set(CMAKE_C_COMPILER arm-linux-gnueabihf-gcc)
endif()
message(STATUS "CMAKE_C_COMPILER: ${CMAKE_C_COMPILER}")

set (CMAKE_C_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -fno-omit-frame-pointer -fsanitize=address -static-libasan")
set (CMAKE_LINKER_FLAGS_DEBUG "${CMAKE_LINKER_FLAGS_DEBUG} -fno-omit-frame-pointer -fsanitize=address -static-libasan")

link_directories(${CMAKE_SOURCE_DIR} wiringPi/)

INCLUDE_DIRECTORIES("wiringPi" "OLED/Fonts" "OLED/Driver")

set(SRCS main.c OLED/Driver/OLED_Config.c OLED/Driver/OLED_Driver.c OLED/Driver/OLED_GUI.c OLED/Fonts/font8.c OLED/Fonts/font12.c OLED/Fonts/font16.c OLED/Fonts/font20.c OLED/Fonts/font24.c) 

add_executable(${PROJECT_NAME} ${HDRS} ${SRCS} )

target_link_libraries(${PROJECT_NAME} -lwiringPi)

if(DEFINED ENV{IN_NIX_SHELL})
  # When compiled by Nix, we need to change interpreter in order to
  # run the resulting binary on Raspbian system.
  add_custom_target(patchelf ALL
    COMMAND patchelf --set-interpreter /lib/ld-linux-armhf.so.3 ${PROJECT_NAME}
    DEPENDS ${PROJECT_NAME}
    )
endif()
