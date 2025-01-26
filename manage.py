#!/usr/bin/env python
import faulthandler
import os
import sys

faulthandler.enable()

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "webapp.settings")

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
