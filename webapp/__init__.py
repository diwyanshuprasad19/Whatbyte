from __future__ import absolute_import, division, print_function, unicode_literals

import site
import os

def rel(*path):
    """
    Converts path relative to the project root into an absolute path

    :rtype: str
    """
    return os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            *path
        )
    ).replace("\\", "/")

site.addpackage(rel(), "apps.pth", known_paths=set())