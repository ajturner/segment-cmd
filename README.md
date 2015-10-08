segment init -u aturner
segment import -f philly_schools.json -d phillyschools
segment datasets -i
segment view -d phillyschools
segment diff -d phillyschools -r 6810