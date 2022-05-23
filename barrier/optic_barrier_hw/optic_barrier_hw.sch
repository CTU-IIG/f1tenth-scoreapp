EESchema Schematic File Version 4
EELAYER 30 0
EELAYER END
$Descr A4 11693 8268
encoding utf-8
Sheet 1 1
Title ""
Date ""
Rev ""
Comp ""
Comment1 ""
Comment2 ""
Comment3 ""
Comment4 ""
$EndDescr
$Comp
L Connector:Barrel_Jack J?
U 1 1 5F2130B5
P 3400 2150
F 0 "J?" H 3455 2475 50  0000 C CNN
F 1 "Barrel_Jack" H 3455 2384 50  0000 C CNN
F 2 "" H 3450 2110 50  0001 C CNN
F 3 "~" H 3450 2110 50  0001 C CNN
	1    3400 2150
	1    0    0    -1  
$EndComp
Wire Wire Line
	3700 2050 3975 2050
Text Notes 9175 1300 0    50   ~ 0
RPI GPIO
Text Notes 3050 2625 0    50   ~ 0
Main Power Input\n12 DCV\n3A max
Wire Wire Line
	9950 1600 9950 1500
Wire Wire Line
	9600 1600 9950 1600
$Comp
L power:+5V #PWR?
U 1 1 5F24D68C
P 9950 1500
F 0 "#PWR?" H 9950 1350 50  0001 C CNN
F 1 "+5V" H 9965 1673 50  0000 C CNN
F 2 "" H 9950 1500 50  0001 C CNN
F 3 "" H 9950 1500 50  0001 C CNN
	1    9950 1500
	1    0    0    -1  
$EndComp
Wire Wire Line
	9600 1700 9950 1700
Wire Wire Line
	9950 1700 9950 1600
Connection ~ 9950 1600
Wire Wire Line
	8850 2000 8850 2050
$Comp
L power:GND #PWR?
U 1 1 5F24E9B0
P 8850 2050
F 0 "#PWR?" H 8850 1800 50  0001 C CNN
F 1 "GND" H 8855 1877 50  0000 C CNN
F 2 "" H 8850 2050 50  0001 C CNN
F 3 "" H 8850 2050 50  0001 C CNN
	1    8850 2050
	1    0    0    -1  
$EndComp
Wire Wire Line
	8475 2400 8475 2350
$Comp
L power:+3.3V #PWR?
U 1 1 5F254C34
P 8475 2350
F 0 "#PWR?" H 8475 2200 50  0001 C CNN
F 1 "+3.3V" H 8490 2523 50  0000 C CNN
F 2 "" H 8475 2350 50  0001 C CNN
F 3 "" H 8475 2350 50  0001 C CNN
	1    8475 2350
	1    0    0    -1  
$EndComp
Wire Wire Line
	8475 2400 9100 2400
Text GLabel 9000 3300 0    50   Input ~ 0
GPIO19
Wire Wire Line
	9000 3300 9100 3300
Text Notes 3175 4625 0    50   ~ 0
Voltage Level Converter\nfrom 12V Logic (Sensor) to 3V3 Logic (RPI)
NoConn ~ 9100 1900
NoConn ~ 9100 2100
NoConn ~ 9100 2200
NoConn ~ 9100 2300
NoConn ~ 9600 1900
NoConn ~ 9600 2000
NoConn ~ 9600 2100
NoConn ~ 9600 2300
NoConn ~ 9600 2400
NoConn ~ 9100 2500
NoConn ~ 9600 2600
NoConn ~ 9600 2700
NoConn ~ 9600 2800
NoConn ~ 9600 2900
NoConn ~ 9100 2700
NoConn ~ 9100 3100
NoConn ~ 9600 3100
NoConn ~ 9600 3300
NoConn ~ 9600 3400
$Comp
L Switch:SW_Push SW?
U 1 1 5F2A78F3
P 6850 2025
F 0 "SW?" H 6850 2310 50  0000 C CNN
F 1 "SW_Push" H 6850 2219 50  0000 C CNN
F 2 "" H 6850 2225 50  0001 C CNN
F 3 "" H 6850 2225 50  0001 C CNN
	1    6850 2025
	1    0    0    -1  
$EndComp
$Comp
L Device:R R?
U 1 1 5F2A78FA
P 6450 1725
F 0 "R?" H 6520 1771 50  0000 L CNN
F 1 "10k" H 6520 1680 50  0000 L CNN
F 2 "" V 6380 1725 50  0001 C CNN
F 3 "~" H 6450 1725 50  0001 C CNN
	1    6450 1725
	1    0    0    -1  
$EndComp
Wire Wire Line
	6450 1875 6450 2025
Wire Wire Line
	6450 2025 6650 2025
Wire Wire Line
	6450 1575 6450 1400
$Comp
L power:+3.3V #PWR?
U 1 1 5F2A7904
P 6450 1400
F 0 "#PWR?" H 6450 1250 50  0001 C CNN
F 1 "+3.3V" H 6465 1573 50  0000 C CNN
F 2 "" H 6450 1400 50  0001 C CNN
F 3 "" H 6450 1400 50  0001 C CNN
	1    6450 1400
	1    0    0    -1  
$EndComp
Text GLabel 7150 2025 2    50   Input ~ 0
GPIO19
Wire Wire Line
	7150 2025 7050 2025
Wire Wire Line
	6475 2975 6675 2975
Text GLabel 7175 2975 2    50   Input ~ 0
GPIO26
Wire Wire Line
	7175 2975 7075 2975
Text GLabel 9000 3400 0    50   Input ~ 0
GPIO26
NoConn ~ 9100 3200
Wire Wire Line
	9100 3400 9000 3400
NoConn ~ 9100 3000
NoConn ~ 9100 2600
Text GLabel 9000 2900 0    50   Input ~ 0
GPIO0
Wire Wire Line
	9100 2900 9000 2900
NoConn ~ 9100 1700
NoConn ~ 9100 1800
Wire Wire Line
	9100 2000 8850 2000
NoConn ~ 9100 1600
$Comp
L Connector_Generic:Conn_02x20_Odd_Even J?
U 1 1 5F213977
P 9300 2500
F 0 "J?" H 9350 3617 50  0000 C CNN
F 1 "Conn_02x20_Odd_Even" H 9350 3526 50  0000 C CNN
F 2 "" H 9300 2500 50  0001 C CNN
F 3 "~" H 9300 2500 50  0001 C CNN
	1    9300 2500
	1    0    0    -1  
$EndComp
NoConn ~ 9100 2800
NoConn ~ 9600 3000
$Comp
L power:+3.3V #PWR?
U 1 1 5F2A9054
P 6475 2350
F 0 "#PWR?" H 6475 2200 50  0001 C CNN
F 1 "+3.3V" H 6490 2523 50  0000 C CNN
F 2 "" H 6475 2350 50  0001 C CNN
F 3 "" H 6475 2350 50  0001 C CNN
	1    6475 2350
	1    0    0    -1  
$EndComp
Wire Wire Line
	6475 2525 6475 2350
Wire Wire Line
	6475 2825 6475 2975
$Comp
L Device:R R?
U 1 1 5F2A904A
P 6475 2675
F 0 "R?" H 6545 2721 50  0000 L CNN
F 1 "10k" H 6545 2630 50  0000 L CNN
F 2 "" V 6405 2675 50  0001 C CNN
F 3 "~" H 6475 2675 50  0001 C CNN
	1    6475 2675
	1    0    0    -1  
$EndComp
$Comp
L Switch:SW_Push SW?
U 1 1 5F2A9043
P 6875 2975
F 0 "SW?" H 6875 3260 50  0000 C CNN
F 1 "SW_Push" H 6875 3169 50  0000 C CNN
F 2 "" H 6875 3175 50  0001 C CNN
F 3 "" H 6875 3175 50  0001 C CNN
	1    6875 2975
	1    0    0    -1  
$EndComp
Text GLabel 9700 3500 2    50   Input ~ 0
GPIO21
Wire Wire Line
	9600 3500 9700 3500
Text Notes 10000 1700 0    50   ~ 0
Power Input to the PRI\nfrom the DC-DC Converter
Text Notes 8600 2675 2    50   ~ 0
Power Output\nfrom the RPI’s onboard\n5V to 3V3 regulator
Wire Wire Line
	6475 3900 6675 3900
Text GLabel 7175 3900 2    50   Input ~ 0
GPIO21
Wire Wire Line
	7175 3900 7075 3900
$Comp
L power:+3.3V #PWR?
U 1 1 6282B6A8
P 6475 3275
F 0 "#PWR?" H 6475 3125 50  0001 C CNN
F 1 "+3.3V" H 6490 3448 50  0000 C CNN
F 2 "" H 6475 3275 50  0001 C CNN
F 3 "" H 6475 3275 50  0001 C CNN
	1    6475 3275
	1    0    0    -1  
$EndComp
Wire Wire Line
	6475 3450 6475 3275
Wire Wire Line
	6475 3750 6475 3900
$Comp
L Device:R R?
U 1 1 6282B6B0
P 6475 3600
F 0 "R?" H 6545 3646 50  0000 L CNN
F 1 "10k" H 6545 3555 50  0000 L CNN
F 2 "" V 6405 3600 50  0001 C CNN
F 3 "~" H 6475 3600 50  0001 C CNN
	1    6475 3600
	1    0    0    -1  
$EndComp
$Comp
L Switch:SW_Push SW?
U 1 1 6282B6B6
P 6875 3900
F 0 "SW?" H 6875 4185 50  0000 C CNN
F 1 "SW_Push" H 6875 4094 50  0000 C CNN
F 2 "" H 6875 4100 50  0001 C CNN
F 3 "" H 6875 4100 50  0001 C CNN
	1    6875 3900
	1    0    0    -1  
$EndComp
NoConn ~ 9100 3500
NoConn ~ 9600 3200
NoConn ~ 9600 1800
NoConn ~ 9600 2200
NoConn ~ 9600 2500
$Comp
L Connector_Generic:Conn_01x04 J?
U 1 1 62860A2F
P 3250 3500
F 0 "J?" H 3170 3075 50  0000 C CNN
F 1 "Conn_01x04" H 3170 3166 50  0000 C CNN
F 2 "" H 3250 3500 50  0001 C CNN
F 3 "~" H 3250 3500 50  0001 C CNN
	1    3250 3500
	-1   0    0    -1  
$EndComp
$Comp
L power:GND #PWR?
U 1 1 628653FE
P 3725 3750
F 0 "#PWR?" H 3725 3500 50  0001 C CNN
F 1 "GND" H 3730 3577 50  0000 C CNN
F 2 "" H 3725 3750 50  0001 C CNN
F 3 "" H 3725 3750 50  0001 C CNN
	1    3725 3750
	1    0    0    -1  
$EndComp
Wire Wire Line
	3450 3700 3725 3700
Wire Wire Line
	3725 3700 3725 3750
$Comp
L power:+12V #PWR?
U 1 1 62868D16
P 3725 3350
F 0 "#PWR?" H 3725 3200 50  0001 C CNN
F 1 "+12V" H 3740 3523 50  0000 C CNN
F 2 "" H 3725 3350 50  0001 C CNN
F 3 "" H 3725 3350 50  0001 C CNN
	1    3725 3350
	1    0    0    -1  
$EndComp
Wire Wire Line
	3450 3400 3725 3400
Wire Wire Line
	3725 3400 3725 3350
NoConn ~ 3450 3600
$Comp
L Switch:SW_SPST SW?
U 1 1 6286E879
P 4175 2050
F 0 "SW?" H 4175 2285 50  0000 C CNN
F 1 "SW_SPST" H 4175 2194 50  0000 C CNN
F 2 "" H 4175 2050 50  0001 C CNN
F 3 "~" H 4175 2050 50  0001 C CNN
	1    4175 2050
	1    0    0    -1  
$EndComp
$Comp
L power:GND #PWR?
U 1 1 6287DA7D
P 3975 2300
F 0 "#PWR?" H 3975 2050 50  0001 C CNN
F 1 "GND" H 3980 2127 50  0000 C CNN
F 2 "" H 3975 2300 50  0001 C CNN
F 3 "" H 3975 2300 50  0001 C CNN
	1    3975 2300
	1    0    0    -1  
$EndComp
Wire Wire Line
	3700 2250 3975 2250
Wire Wire Line
	3975 2250 3975 2300
$Comp
L power:+12V #PWR?
U 1 1 62882026
P 4650 2000
F 0 "#PWR?" H 4650 1850 50  0001 C CNN
F 1 "+12V" H 4665 2173 50  0000 C CNN
F 2 "" H 4650 2000 50  0001 C CNN
F 3 "" H 4650 2000 50  0001 C CNN
	1    4650 2000
	1    0    0    -1  
$EndComp
Wire Wire Line
	4375 2050 4650 2050
Wire Wire Line
	4650 2050 4650 2000
$Comp
L Transistor_FET:BS170 Q?
U 1 1 628AC2FF
P 4575 3500
F 0 "Q?" H 4780 3546 50  0000 L CNN
F 1 "BS170" H 4780 3455 50  0000 L CNN
F 2 "Package_TO_SOT_THT:TO-92_Inline" H 4775 3425 50  0001 L CIN
F 3 "http://www.fairchildsemi.com/ds/BS/BS170.pdf" H 4575 3500 50  0001 L CNN
	1    4575 3500
	1    0    0    -1  
$EndComp
$Comp
L Device:R R?
U 1 1 628AC305
P 4675 2950
F 0 "R?" H 4745 2996 50  0000 L CNN
F 1 "10k" H 4745 2905 50  0000 L CNN
F 2 "" V 4605 2950 50  0001 C CNN
F 3 "~" H 4675 2950 50  0001 C CNN
	1    4675 2950
	1    0    0    -1  
$EndComp
Wire Wire Line
	4675 3100 4675 3225
Wire Wire Line
	5000 3225 4675 3225
Connection ~ 4675 3225
Wire Wire Line
	4675 3225 4675 3300
$Comp
L power:+3.3V #PWR?
U 1 1 628AC30F
P 4675 2650
F 0 "#PWR?" H 4675 2500 50  0001 C CNN
F 1 "+3.3V" H 4690 2823 50  0000 C CNN
F 2 "" H 4675 2650 50  0001 C CNN
F 3 "" H 4675 2650 50  0001 C CNN
	1    4675 2650
	1    0    0    -1  
$EndComp
Wire Wire Line
	4675 2650 4675 2800
Wire Wire Line
	4675 3700 4675 3925
$Comp
L power:GND #PWR?
U 1 1 628AC317
P 4475 3975
F 0 "#PWR?" H 4475 3725 50  0001 C CNN
F 1 "GND" H 4480 3802 50  0000 C CNN
F 2 "" H 4475 3975 50  0001 C CNN
F 3 "" H 4475 3975 50  0001 C CNN
	1    4475 3975
	1    0    0    -1  
$EndComp
Text GLabel 5000 3225 2    50   Input ~ 0
GPIO0
$Comp
L Device:R R?
U 1 1 628AC320
P 4300 3700
F 0 "R?" H 4370 3746 50  0000 L CNN
F 1 "9k" H 4370 3655 50  0000 L CNN
F 2 "" V 4230 3700 50  0001 C CNN
F 3 "~" H 4300 3700 50  0001 C CNN
	1    4300 3700
	1    0    0    -1  
$EndComp
Wire Wire Line
	4300 3850 4300 3925
Wire Wire Line
	4300 3925 4475 3925
Wire Wire Line
	4475 3925 4475 3975
Connection ~ 4475 3925
Wire Wire Line
	4475 3925 4675 3925
Wire Wire Line
	4300 3550 4300 3500
Connection ~ 4300 3500
Wire Wire Line
	4300 3500 4375 3500
Wire Wire Line
	3450 3500 4300 3500
$EndSCHEMATC
