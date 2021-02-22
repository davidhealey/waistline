#!/usr/bin/env bash

fonts=(
    "Material Icons"
    "Material Icons Outlined"
    "Material Icons Round"
    "Material Icons Sharp"
    "Material Icons Two Tone"
)

# see https://www.w3schools.com/css/css3_fonts.asp
# see http://useragentstring.com/pages/useragentstring.php
agents=(
    # woff2 - chrome 70
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36"
    # woff - ie 11
    "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko"
    # eot - ie 6
    "Mozilla/4.0 (compatible; MSIE 6.01; Windows NT 6.0)"
    # ttf/otf - safari 3.1
    "Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_5_4; en-us) AppleWebKit/525.18 (KHTML, like Gecko) Version/3.1 Safari/525.13"
)

baseurl="https://fonts.googleapis.com/icon?family="
dest="$(dirname "$0")/../iconfont"

download_fonts() {
    for font in "${fonts[@]}"; do
        download_font "$font"
    done
}

download_font() {
    for agent in "${agents[@]}"; do
        download_as "$agent" "$baseurl${1// /+}"
    done
}

download_as() {
    local css="$(curl -sL -H "User-Agent: $1" "$2")"
    local name="$(match "$css" "font-family: *'([^']+)';")"; name="${name// /}"
    local url="$(match "$css" "src: *url\(([^\)]+)\)")"; url="${url//[\'\"]/}"
    local ext="$(match "$url" "\.([^\.]+)$")"
    name="$name-Regular.$ext"
    echo -n "Downloading $name from $url..."
    curl -sL $url -o "$dest/$name"
    echo "Done"
}

match() {
    [[ $1 =~ $2 ]]
    echo "${BASH_REMATCH[1]}"
}

main() {
    download_fonts "$@"
}

main "$@"
