/*
 * Copyright (C) 2020 Tomas Prochazka <tomas.prochazka@cvut.cz>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
 */

#include <arpa/inet.h>
#include <sys/socket.h>
#include <netdb.h>
#include <ifaddrs.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <linux/if_link.h>
#include <net/if.h>
#include <time.h>
#include <sys/time.h>
#include <limits.h>
#include <string.h>
#include <stdbool.h>

char ip_address[] = "IP:";
char password[] = "Password:user";
char user[] = "User:pi";
char host[NI_MAXHOST];

char lap_str_init[] = {"LAP: 00:00:000"};
char best_str_init[] = {"BEST: 00:00:000"};

#include <wiringPi.h>

#include "OLED_Config.h"
#include "OLED_Driver.h"
#include "OLED_GUI.h"
#include "Show_Lib.h"

#define BARRIER_SIGNAL 0     // 30
#define UNIVERSAL_BUTTON1 19 // 24
#define UNIVERSAL_BUTTON2 26 // 25
#define SHUTDOWN_BUTTON 21   // 29

#define MIN_TIME_US 1000000

volatile int detect_object = 0;

void interrupt_optic_barrier()
{
    detect_object = 1;
}

int show_ip_address()
{
    struct ifaddrs *ifa;
    int family, s; // n;

    if (getifaddrs(&ifa) == -1) {
        perror("getifaddrs");
        return EXIT_FAILURE;
    }

    for (; ifa != NULL; ifa = ifa->ifa_next) {
        if (ifa->ifa_addr == NULL)
            continue;

        if ((strcmp("lo", ifa->ifa_name) == 0) || !(ifa->ifa_flags & (IFF_RUNNING)))
            continue;

        family = ifa->ifa_addr->sa_family;

        if (family == AF_INET) {
            s = getnameinfo(ifa->ifa_addr, sizeof(struct sockaddr_in), host, NI_MAXHOST, NULL, 0, NI_NUMERICHOST);
            if (s != 0) {
                printf("getnameinfo() failed: %s\n", gai_strerror(s));
                return EXIT_FAILURE;
            }

            // printf("%s%s\n",ip_address, host);
        }
    }

    freeifaddrs(ifa);

    return EXIT_SUCCESS;
}

typedef struct mytime_t {
    int minutes;
    int seconds;
    int miliseconds;
} mytime_t;

void convert_time(mytime_t *mytime, unsigned long time_us)
{
    // minutes
    mytime->minutes = 0;
    mytime->minutes = (int)time_us / 60000000;
    time_us = time_us - mytime->minutes * 60000000;
    // seconds
    mytime->seconds = (int)time_us / 1000000;
    time_us = time_us - mytime->seconds * 1000000;
    // milisec
    mytime->miliseconds = (int)time_us / 1000;
    time_us = time_us - mytime->miliseconds * 1000;
}

char *us2str(char *dest, const char *prefix, long unsigned time_us)
{
        mytime_t mytime;
        convert_time(&mytime, time_us);
        sprintf(dest, "%s%02d:%02d:%02d", prefix, mytime.minutes, mytime.seconds, mytime.miliseconds);
        return dest;
}

struct state {
    unsigned long time_us;
    unsigned long lap_time_us;
    unsigned long best_time_us;
} state;

enum screen { EMPTY, TIME, SHUTDOWN };

void update_display(enum screen screen)
{
    GUI_Clear();
    switch (screen) {
    case EMPTY:
        break;
    case TIME: {
        char str[50];
        sFONT *font = &Font12;

        us2str(str, "", state.time_us);
        GUI_DisString_EN(10, 0, str, font, FONT_BACKGROUND, WHITE);                   // actual time

        us2str(str, "LAP: ", state.lap_time_us);
        GUI_DisString_EN(0, font->Height - 2, str, font, FONT_BACKGROUND, WHITE);     // lap time

        us2str(str, "BEST: ", state.best_time_us);
        GUI_DisString_EN(0, 2 * font->Height - 4, str, font, FONT_BACKGROUND, WHITE); // best time
        break;
    }
    case SHUTDOWN:
        GUI_DisString_EN(10, 0, "Shutdown", &Font16, FONT_BACKGROUND, WHITE);
    }
    GUI_Display();
}

unsigned long usec_between(const struct timeval *start, const struct timeval *stop)
{
    return (stop->tv_sec - start->tv_sec) * 1000000 + stop->tv_usec - start->tv_usec;
}

int main(int argc, char *argv[])
{
    // 1.System Initialization
    if (System_Init())
        exit(0);

    // 2.show
    OLED_Init();

    GUI_Init(OLED_WIDTH, OLED_HEIGHT);
    GUI_Clear();

    sFONT *font = &Font12;

    char *name_user;
    name_user = (char *)malloc(10 * sizeof(char));
    cuserid(name_user);
    free(name_user);
    // printf("%s%s\n",user, name_user);
    printf("%s%s\n", user, name_user);
    GUI_Clear();
    GUI_DisString_EN(10, 0, "Hello user", &Font16, FONT_BACKGROUND, WHITE);
    GUI_Display();

    GUI_Clear();
    GUI_DisString_EN(0, 0, user, font, FONT_BACKGROUND, WHITE);

    printf("%s\n", password);
    GUI_DisString_EN(0, font->Height - 2, password, font, FONT_BACKGROUND, WHITE);

    int len_ip_string = strlen(host);
    int i;
    for (i = 0; i < 20; i++) {
        show_ip_address();
        if (strlen(host) > len_ip_string)
            break;
        sleep(1);
    }
    char ip_str[30];
    strcpy(ip_str, ip_address);
    strcat(ip_str, host);

    GUI_DisString_EN(0, 2 * font->Height - 4, ip_str, font, FONT_BACKGROUND, WHITE);

    printf("%s%s\n", ip_address, host);
    fflush(stdout);

    GUI_Display();
    sleep(2);

    struct timeval stop, start;
    bool no_lap = false;
    // gettimeofday(&start, NULL);

    // This initialises the wiringPi system
    // and assumes that the calling program is going to be using the wiringPi pin numbering scheme.
    if (wiringPiSetup() < 0)
        return 1;
    // This function registers a function to received interrupts on the specified pin.
    if (wiringPiISR(BARRIER_SIGNAL, INT_EDGE_RISING, &interrupt_optic_barrier) < 0) {
        printf("Unable to setup ISR \n");
    }

    bool after_start = false;
    state.best_time_us = LONG_MAX;

    while (1) {
        update_display(TIME);

        if (digitalRead(SHUTDOWN_BUTTON) == 1) {
            update_display(SHUTDOWN);
            sleep(2);
            update_display(EMPTY);
            System_Exit();
            system("sudo shutdown -h now");
            return 0;
        }

        /* Reset everything */
        if (digitalRead(UNIVERSAL_BUTTON1) == 1) {
            after_start = false;
            no_lap = false;
            state.time_us = 0;
            state.lap_time_us = 0;
            state.best_time_us = LONG_MAX;
        }

        if (after_start) {
            gettimeofday(&stop, NULL);
            state.time_us = usec_between(&start, &stop);
        }

        if (detect_object) {
            after_start = true;
            detect_object = 0;
            printf("DETECT OBJECT");

            gettimeofday(&stop, NULL);
            state.time_us = usec_between(&start, &stop);

            if ((no_lap == false) || (state.time_us > MIN_TIME_US)) {
                gettimeofday(&start, NULL);

                printf("\n");
                fflush(stdout);

                if (no_lap == true) {
                    state.lap_time_us = state.time_us;

                    if (state.best_time_us > state.time_us)
                        state.best_time_us = state.time_us;
                }
                no_lap = true;
            } else {
                printf(":FALSE\n");
                fflush(stdout);
            }
        }
    }
    System_Exit();
}

/* Local Variables: */
/* c-basic-offset: 4 */
/* End: */
