#!/bin/bash

mkdir -p ~/.vim/syntax
mkdir -p ~/.vim/ftdetect
BASEDIR=$(dirname $0)
cp $BASEDIR/freemo.vim ~/.vim/syntax
echo "au BufRead,BufNewFile *.fre set filetype=freemo" > ~/.vim/ftdetect/freemo.vim