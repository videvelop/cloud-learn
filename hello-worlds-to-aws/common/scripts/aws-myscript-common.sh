#!/bin/sh

# the following avoids pagination in aws cli outputs; if this is not set, lengthy aws cli outputs will require inputs equivalent to linux 'less' command.
export AWS_PAGER=""

# This script is inspired by https://stackoverflow.com/questions/402377/using-getopts-to-process-long-and-short-command-line-options 
# NOTE: This requires GNU getopt.  On Mac OS X and FreeBSD, you have to install this
# separately; see below.
TEMP=$(getopt -o hcdlo: --long help,create,delete,list,outputfile:\
               -- "$@")

if [ $? != 0 ] ; then echo "Terminating..." >&2 ; exit 1 ; fi

# Note the quotes around '$TEMP': they are essential!
eval set -- "$TEMP"

RED='\033[0;31m'
NC='\033[0m' # No Color
printf "${RED}Caution: This script is for ease of use during learning only.  Not for any serious development/test/production use.

This script may create/delete AWS resources that may cost you money or loss of data.  

You WILL need to understand the resources created/deleted by this script and decide for yourself whether to run this script or not. ${NC}\n"
echo "$0 --help"

echo "====="

OUTPUTFILE=./myout.log
HELP=false
CREATE=false
LIST=false
DELETE=false

while true; do
  case "$1" in
    -h | --help ) HELP=true; shift ;;
    -c | --create ) CREATE=true; shift ;;
    -d | --delete ) DELETE=true; shift 2 ;;
    -l | --list ) LIST=true; shift 2 ;;
    -o | --outputfile ) OUTPUTFILE="$2"; shift 2 ;;
    -- ) shift; break ;;
    * ) break ;;
  esac
done

GetYN () {
while true; do
    read -p "Do you wish to continue (y/n)?" yn
    case $yn in
        [Yy]* ) echo "Continuing..."; break;;
        [Nn]* ) echo "Remember to delete partially created resources if any..."; exit;;
        * ) echo "Answer 'y' or 'n'.";;
    esac
done
}
